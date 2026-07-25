# BJ Electronics Commerce Platform

Production-oriented full-stack monorepo for the public BJ Electronics store and its isolated administration application.

## Applications

```text
apps/store   Public storefront
apps/admin   Secure administration portal
```

Canonical production domains:

```text
Store: https://www.bjelectronics.shop
Admin: https://admin.bjelectronics.shop
```

`www.bjelectronics.shop-admin` is not a usable public hostname because `.shop-admin` is not a delegated top-level domain. The administration application therefore uses the secure subdomain `admin.bjelectronics.shop`.

## Shared platform packages

```text
packages/config     Canonical origins, runtime validation, release metadata and structured logging
packages/database   PostgreSQL catalog, inventory, metrics and event repositories
packages/realtime   Durable commerce event and server-sent event contracts
packages/ui         Shared BJ Electronics brand components
```

## Implemented capabilities

- Responsive public storefront with search, product details and persistent local cart
- Isolated responsive administration dashboard
- Database-backed product and inventory management
- Draft, active and archived publication workflows
- Optimistic product-version protection for concurrent edits
- Durable commerce event log and server-sent event synchronization
- PostgreSQL-backed administrator sessions
- Password, Google/Gmail and Facebook authentication
- Role-aware product mutation APIs
- Connected-account security management
- Separate liveness and readiness endpoints
- Production environment preflight validation
- Serialized, checksum-protected PostgreSQL migrations
- Release metadata in health responses
- Hardened browser and transport security headers
- GitHub Actions quality gates and dual Hostinger release verification

## Development

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev:store
npm run dev:admin
```

Default local applications:

```text
Store: http://localhost:3000
Admin: run on a separate port, for example npm run dev:admin -- --port 3001
```

Quality gates:

```bash
npm run db:validate
npm run typecheck
npm run lint
npm run build
```

## Database

Run all idempotent migrations from the repository root:

```bash
npm run db:migrate
```

The migration runner serializes deployments with a PostgreSQL advisory lock and refuses to continue when an already-applied migration file has changed.

## Production deployment

Create two Hostinger Node.js Web Apps from the same GitHub repository and `main` branch. Keep the application working directory at the repository root so npm workspaces, shared packages and `package-lock.json` are available.

### Store deployment

```text
Repository working directory: /
Workspace application: apps/store
Domain: www.bjelectronics.shop
Install: npm ci --no-audit --no-fund
Preflight: npm run validate:store
Migration: npm run db:migrate
Build: npm run build:store
Start: npm run start:store
Readiness: https://www.bjelectronics.shop/health/ready
Liveness: https://www.bjelectronics.shop/health/live
```

### Admin deployment

```text
Repository working directory: /
Workspace application: apps/admin
Domain: admin.bjelectronics.shop
Install: npm ci --no-audit --no-fund
Preflight: npm run validate:admin
Migration: npm run db:migrate
Build: npm run build:admin
Start: npm run start:admin
Readiness: https://admin.bjelectronics.shop/health/ready
Liveness: https://admin.bjelectronics.shop/health/live
```

Both applications use the same PostgreSQL database. Administration mutations create durable events that the storefront consumes through `/api/realtime`.

See:

- `docs/PHASE_1_DEPLOYMENT_HARDENING.md`
- `docs/BACKUP_RESTORE_RUNBOOK.md`
- `docs/ROLLBACK_RUNBOOK.md`
- `docs/MONOREPO_DEPLOYMENT.md`
- `docs/AUTHENTICATION.md`
- `docs/HOSTINGER_GITHUB_INTEGRATION.md`

## Brand directories

- Canonical source: `assets/brand/source/`
- Legacy runtime assets: `public/brand/`
- Administration runtime assets: `apps/admin/public/brand/`
- Shared vector brand component: `packages/ui/src/index.tsx`
