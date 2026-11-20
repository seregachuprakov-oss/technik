# Деплой «Техник · Котлас» на Timeweb

Сервер общий с другими проектами оператора (globus:3020, les:3030(?), svoe:3010, и т.д.) —
соблюдать изоляцию по пользователю, порту и БД.

## 1. Параметры

| Параметр | Значение |
|---|---|
| Сервер | `root@5.42.116.170` (Timeweb) |
| SSH-ключ | `~/Documents/aidamaster/.deploy/timeweb_key` |
| Системный пользователь | `tehnik` |
| Каталог | `/var/www/tehnik` |
| Порт приложения | `3070` |
| systemd | `tehnik-web.service` |
| nginx | `/etc/nginx/sites-available/tehnik` → `sites-enabled/tehnik` |
| БД | PostgreSQL (локальная на сервере), база `tehnik_db`, роль `tehnik_app`, только `127.0.0.1` |
| Технический домен | `https://tehnik.5-42-116-170.sslip.io` |
| Боевой домен | нет (ждём владельца) |

## 2. Скрипт `scripts/deploy.sh`

```bash
cd ~/Documents/tehnik-kotlas-site
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Делает: создаёт пользователя/БД/systemd/nginx при первом запуске; rsync кода
(`-rlptDz`, без `-o/-g`); на сервере — `npm install`, `npm run migrate`, `npm run seed`
(категории + 2 демо-товара через реальный импорт-пайплайн), `npm run build`, restart.

## 3. `.env.local` на сервере

Заполнить по `.env.local.example`. Обязательно сменить `ADMIN_PASSWORD` на реальный,
`ADMIN_SESSION_SECRET` сгенерировать (`openssl rand -hex 32`), `ORDERS_MODE=demo` —
оставить demo, пока у магазина нет эквайринга.

## 4. nginx: важная деталь — proxy_buffer_size

Next.js 16 на динамических страницах может отдавать 502 "upstream sent too big header"
без увеличенных буферов. В vhost обязательно:

```nginx
proxy_buffer_size 64k;
proxy_buffers 8 64k;
```

(уже встроено в `scripts/deploy.sh`).

## 5. Проверка после деплоя

```bash
systemctl is-active tehnik-web
curl -s -o /dev/null -w "%{http_code}\n" https://tehnik.5-42-116-170.sslip.io/
curl -s -o /dev/null -w "%{http_code}\n" https://tehnik.5-42-116-170.sslip.io/catalog
curl -s -o /dev/null -w "%{http_code}\n" https://tehnik.5-42-116-170.sslip.io/catalog/termoklejevoj-pistolet-7-7-4mm-190c
curl -s -o /dev/null -w "%{http_code}\n" https://tehnik.5-42-116-170.sslip.io/admin/login
```

## 6. Переход demo → live (эквайринг)

Пока нет реального договора с банком/эквайером — переключать `ORDERS_MODE` на `live`
НЕЛЬЗЯ, это создаст у покупателей ложное ожидание реальной оплаты. Когда появится
эквайринг: завести ключи в `.env.local`, реализовать провайдера оплаты (сейчас не
реализован и не должен быть сымитирован), только после этого переключать режим.

## 6a. Фото товаров, загруженные сотрудником

Лежат в `public/uploads/products/` на сервере и **исключены из rsync** — выкладка
новой версии их не стирает. Бэкап этой папки делается отдельно от кода.
Если `npm install` на сервере не поднял нативную часть `sharp`, загрузка всё равно
работает: файл сохраняется без пережатия, а причина пишется в `journalctl -u tehnik-web`.

## 7. Известные грабли этого сервера

- `curl localhost:3000` может попасть в чужой проект — у каждого свой порт, у «Техник» — 3070.
- Turbopack после инкрементальных сборок может выдавать ложные ошибки — `rm -rf .next` перед пересборкой.
- rsync нескольких файлов из разных подкаталогов в одно место без `-R` — ломает деплой; здесь используется
  `rsync -rlptDz` всей директории целиком, что безопасно.
