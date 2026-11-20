-- AI-обогащение карточек товара (черновик описания + иллюстративное фото),
-- всегда через ручное подтверждение админом — см. docs/TZ_MASTER.md и
-- README раздела /admin/enrichment. Никогда не публикуется автоматически.

-- Фото: либо реальное (загружено сотрудником — пока без отдельной формы
-- загрузки, см. редизайн-агента), либо AI-иллюстрация до замены реальным
-- фото. 'none' — пока нет никакого фото (текущее поведение по умолчанию).
ALTER TABLE products ADD COLUMN image_source text NOT NULL DEFAULT 'none'
  CHECK (image_source IN ('none', 'real_upload', 'ai_illustrative'));

-- Демо-партия для проверки пайплайна AI-обогащения (см. ТЗ "Test it
-- end-to-end on a demo batch") — явный флаг, чтобы демо-товары никогда не
-- попали в боевую выгрузку/отчёты как реальный товар магазина.
ALTER TABLE products ADD COLUMN is_demo boolean NOT NULL DEFAULT false;

CREATE TABLE enrichment_drafts (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status               text NOT NULL DEFAULT 'pending_review'
                         CHECK (status IN ('pending_review', 'approved', 'rejected')),
  -- Снимок фактов, на которых основывался AI в момент генерации (имя,
  -- категория, артикул/штрихкод, specs, старое описание из 1С) — хранится,
  -- чтобы ревьюер видел ровно то, из чего AI делал вывод, даже если карточка
  -- товара потом изменится.
  input_facts          jsonb NOT NULL,
  source_note          text,              -- текст/URL, который вручную вставил сотрудник (опционально)
  draft_description    text,
  draft_image_path     text,              -- "/uploads/enrichment/<id>.png" (относительно public/)
  draft_image_source   text CHECK (draft_image_source IN ('ai_illustrative')),
  draft_image_error    text,              -- если генерация картинки не удалась — причина; текст всё равно уходит на ревью
  -- Результат автоматической сверки: числа/факты в черновике, которых нет
  -- во входных данных — простая эвристика "число есть в тексте, но не в
  -- источнике", без ML, см. src/server/enrichment/crossCheck.ts.
  cross_check_warnings jsonb NOT NULL DEFAULT '[]',
  ai_text_model        text,
  ai_image_model       text,
  created_by           text NOT NULL DEFAULT 'admin',
  created_at           timestamptz NOT NULL DEFAULT now(),
  reviewed_by          text,
  reviewed_at          timestamptz,
  review_note          text
);
CREATE INDEX enrichment_drafts_product_idx ON enrichment_drafts(product_id, created_at DESC);
CREATE INDEX enrichment_drafts_status_idx ON enrichment_drafts(status, created_at DESC);
