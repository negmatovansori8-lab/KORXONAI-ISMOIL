# Oil Enterprise Management System (OEMS)

Enterprise platform for oil company operations: finance, workforce, production, warehouse, and executive analytics.

## Architecture

```
┌──────────────┐     JWT      ┌─────────────────┐      Prisma      ┌──────────┐
│ Railway Web  │ ───────────► │ Railway API     │ ───────────────► │ Neon PG  │
│ Next.js UI   │ ◄─────────── │ Express /api/*  │                  │          │
└──────────────┘   JSON/PDF   └─────────────────┘                  └──────────┘
```

Deploy: **Railway** (frontend + backend) + **Neon** (PostgreSQL). See [`DEPLOY.md`](DEPLOY.md).

Roles: **CEO · Manager · Admin · Employee** with JWT authentication and route-level authorization.

Finance identity is computed, not hard-coded:

`Profit = (Oil sales + Services + Other income) − (Salary + Equipment + Transport + Tax + Other)`

Payroll:

`Net = Base + Bonus + (Base × Performance% × 0.15) + Reward − Deduction`

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts, Framer Motion |
| Backend | Node.js, Express, Prisma, Zod, JWT, Helmet, rate limit |
| Database | Neon PostgreSQL (local: Docker Postgres 16) |
| Export | ExcelJS, PDFKit |
| Deploy | Railway (web + API) + Neon |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| CEO | ceo@oilenterprise.tj | CEO@2026 |
| Manager | manager@oilenterprise.tj | Manager@2026 |
| Admin | admin@oilenterprise.tj | Admin@2026 |
| Employee | employee@oilenterprise.tj | Employee@2026 |

## Local run

PostgreSQL is required (Neon URL or local Docker).

```bash
docker compose up -d postgres
```

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 (or http://localhost:3001 if 3000 is busy). API: http://localhost:4000/api/health

## Full stack (Docker)

```bash
docker compose up --build
```

## Modules

1. CEO dashboard — KPIs with actuals and %, daily/monthly/yearly filters, six professional charts
2. Manager — departments, tasks, daily reports, equipment
3. Admin — users, roles, enable/disable, backup trigger
4. HR — employee directory, profiles, payroll engine
5. Finance — income/expense ledger and live P&L
6. Production — wells, plan vs actual, statistics
7. Warehouse — stock, inbound/outbound, movement history

## Security

- Passwords hashed with bcrypt
- JWT bearer tokens
- Helmet, CORS allowlist, login rate limit
- Role guards on mutating endpoints
- Audit log for sensitive actions

## Backup & storage

- `POST /api/storage/upload` — local object store (S3-shaped, swap adapter later)
- `POST /api/storage/backup` — SQLite file copy (or `pg_dump` when using PostgreSQL)
- `GET /api/export/excel` and `/api/export/pdf`

## Languages

Тоҷикӣ / Русский / English (header switcher).
