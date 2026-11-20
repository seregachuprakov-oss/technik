-- «Техник» · Котлас — ядро каталога, импорта из 1С и демо-заказов.
-- Паттерны — из globus-kotlas-site: TEXT + CHECK вместо ENUM, деньги в целых копейках,
-- timestamptz (UTC), append-only журналы там, где нужна история.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  sort        int NOT NULL DEFAULT 100,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Каталог. Идентичность товара между импортами — onec_id (GUID номенклатуры 1С),
-- НИКОГДА имя или артикул (они могут совпадать или меняться у поставщика).
-- id — внутренний стабильный UUID, на него завязаны заказы/лог изменений.
CREATE TABLE products (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onec_id            text UNIQUE,              -- GUID номенклатуры 1С; NULL = товар создан вручную в админке
  category_id        uuid REFERENCES categories(id),
  subcategory        text,                     -- свободный текст: "Клеевые пистолеты", "Степлеры"...
  slug               text UNIQUE NOT NULL,
  name               text NOT NULL,
  description        text NOT NULL DEFAULT '',
  article            text,                     -- артикул/код EAC
  barcode            text,                     -- штрихкод EAN
  unit               text NOT NULL DEFAULT 'шт',
  price_kopecks      int NOT NULL CHECK (price_kopecks >= 0),
  price_source       text NOT NULL DEFAULT 'import' CHECK (price_source IN ('import','confirmed','estimated_placeholder')),
  stock_qty          int NOT NULL DEFAULT 0,
  stock_updated_at   timestamptz,              -- когда остаток последний раз пришёл из импорта
  is_visible         boolean NOT NULL DEFAULT true,   -- показывать в каталоге
  is_available       boolean NOT NULL DEFAULT true,   -- false = нет в наличии (в т.ч. авто при stock=0)
  manual_override    boolean NOT NULL DEFAULT false,  -- true = карточку правил человек, импорт не трогает защищённые поля
  overridden_fields  text[] NOT NULL DEFAULT '{}',    -- какие поля защищены: name,description,price,category,subcategory
  image_path         text,
  specs              jsonb NOT NULL DEFAULT '{}',     -- {"диаметр стержня":"7-7.4 мм", ...}
  sort               int NOT NULL DEFAULT 100,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON products(category_id, sort);
CREATE INDEX products_visible_idx ON products(is_visible, is_available);

-- Журнал ручных и автоматических изменений карточки товара (цена, описание,
-- видимость, авто-скрытие при нулевом остатке) — кто/когда/почему.
CREATE TABLE product_change_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  field       text NOT NULL,
  old_value   text,
  new_value   text,
  reason      text NOT NULL,     -- 'admin_edit' | 'import_update' | 'auto_hide_zero_stock' | 'import_create'
  actor       text NOT NULL,     -- 'admin' | 'import' | 'system'
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_change_log_product_idx ON product_change_log(product_id, created_at DESC);

-- Каждый запуск импорта CSV/Excel-выгрузки из 1С: счётчики строк и статус,
-- чтобы при сбое/опоздании показать баннер в админке, а не затирать остатки нулями.
CREATE TABLE import_runs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename       text NOT NULL,
  status         text NOT NULL CHECK (status IN ('ok','partial','failed')),
  rows_total     int NOT NULL DEFAULT 0,
  rows_created   int NOT NULL DEFAULT 0,
  rows_updated   int NOT NULL DEFAULT 0,
  rows_skipped   int NOT NULL DEFAULT 0,
  rows_errored   int NOT NULL DEFAULT 0,
  error_summary  text,
  actor          text NOT NULL DEFAULT 'admin',
  started_at     timestamptz NOT NULL DEFAULT now(),
  finished_at    timestamptz
);
CREATE INDEX import_runs_finished_idx ON import_runs(finished_at DESC);

CREATE SEQUENCE order_number_seq START 1001;

CREATE TABLE orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no         bigint NOT NULL UNIQUE DEFAULT nextval('order_number_seq'),
  public_token     text NOT NULL UNIQUE,   -- страница статуса заказа без логина
  status           text NOT NULL DEFAULT 'pending_confirmation'
                     CHECK (status IN ('pending_confirmation','confirmed','ready_for_pickup','done','cancelled')),
  customer_name    text NOT NULL,
  customer_phone   text NOT NULL,
  fulfillment      text NOT NULL DEFAULT 'pickup' CHECK (fulfillment IN ('pickup','delivery')),
  address          text,
  comment          text,
  subtotal_kopecks int NOT NULL,
  total_kopecks    int NOT NULL,
  is_demo          boolean NOT NULL DEFAULT true,  -- нет эквайринга: ВСЕ заказы этой фазы — демо
  source           text NOT NULL DEFAULT 'site',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_created_idx ON orders(created_at DESC);
CREATE INDEX orders_phone_idx ON orders(customer_phone);

CREATE TABLE order_items (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id         uuid REFERENCES products(id),
  product_name       text NOT NULL,
  unit_price_kopecks int NOT NULL,
  qty                int NOT NULL CHECK (qty > 0),
  line_total_kopecks int NOT NULL
);
CREATE INDEX order_items_order_idx ON order_items(order_id);

-- Заявки с лендинга проката и из форм захвата контактов для мессенджеров.
-- Боты (Telegram/VK/MAX) не подключены — см. docs/BOTS_TODO.md; это только хранение.
CREATE TABLE leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic           text NOT NULL DEFAULT 'general' CHECK (topic IN ('general','rental','callback')),
  name            text NOT NULL,
  phone           text NOT NULL,
  channel_pref    text NOT NULL DEFAULT 'call' CHECK (channel_pref IN ('call','telegram','vk','max','whatsapp')),
  message         text,
  status          text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  source          text NOT NULL DEFAULT 'site',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_created_idx ON leads(created_at DESC);

-- Корзина, персистентная на сервере только с момента оформления (до этого — localStorage на клиенте).
CREATE TABLE carts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items      jsonb NOT NULL DEFAULT '[]',   -- [{productId, qty}]
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE admin_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  text UNIQUE NOT NULL,
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor      text NOT NULL,
  action     text NOT NULL,
  entity     text,
  entity_id  text,
  payload    jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_idx ON audit_log(created_at DESC);
