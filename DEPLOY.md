# Деплой: Railway (фронт + API) + Neon

Фронт → **Railway** · API → **Railway** · База → **Neon (PostgreSQL)**

```
Telegram Mini App / браузер
        │
        ▼
 Railway Web (Next.js)  ──JWT──►  Railway API (Express)  ──Prisma──►  Neon
```

Один проект Railway, **два сервиса** из одного GitHub-репо.

---

## 1. Neon (база)

1. [neon.tech](https://neon.tech) → New Project → PostgreSQL.
2. Dashboard → **Connection string**.
3. Берите **прямое** подключение (хост **без** `-pooler`), с `?sslmode=require`.

```
postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

---

## 2. GitHub

Залейте проект в репозиторий.

---

## 3. Railway — API (`backend`)

1. [railway.app](https://railway.app) → New Project → **Deploy from GitHub**.
2. Root Directory: **`backend`**
3. Variables:

| Variable | Значение |
|---|---|
| `DATABASE_URL` | строка Neon |
| `JWT_SECRET` | длинный случайный секрет |
| `JWT_EXPIRES_IN` | `12h` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | URL фронта (после шага 4) |
| `MINIAPP_URL` | URL фронта |
| `SEED_ON_BOOT` | `true` |
| `TELEGRAM_BOT_TOKEN` | токен бота (если Mini App) |

`PORT` Railway ставит сам. Generate Domain для API.

Проверка: `https://ВАШ-API.up.railway.app/api/health`

---

## 4. Railway — фронт (`frontend`)

В **том же** проекте Railway: **New Service** → GitHub (тот же репо).

1. Root Directory: **`frontend`**
2. Builder: Nixpacks (файл `railway.json` уже это задаёт).
3. Variables:

| Variable | Значение |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://ВАШ-API.up.railway.app/api` |
| `NODE_ENV` | `production` |

Важно: в конце **`/api`**. Переменную задайте **до** билда — она вшивается в фронт.

4. Settings → **Generate Domain**. Получите `https://ВАШ-WEB.up.railway.app`.
5. Вернитесь в сервис API и поставьте:

```
CORS_ORIGIN=https://ВАШ-WEB.up.railway.app
MINIAPP_URL=https://ВАШ-WEB.up.railway.app
```

6. Redeploy API, затем Redeploy фронт (если URL API менялся).

---

## 5. Telegram Mini App

BotFather → Web App URL:

```
https://ВАШ-WEB.up.railway.app
```

---

## Демо-логины (после seed)

| Роль | Email | Пароль |
|---|---|---|
| Раис | ceo@oilenterprise.tj | CEO@2026 |
| Менеджер | manager@oilenterprise.tj | Manager@2026 |
| Админ | admin@oilenterprise.tj | Admin@2026 |
| Сотрудник | employee@oilenterprise.tj | Employee@2026 |

---

## Локально с PostgreSQL

```bash
docker compose up -d postgres
```

В `backend/.env`:

```
DATABASE_URL=postgresql://oems:oems_secure_2026@localhost:5432/oil_enterprise?schema=public
```

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

```bash
cd frontend
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm run dev
```
