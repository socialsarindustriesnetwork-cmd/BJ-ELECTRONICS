# Phase 1 — Deployment Hardening

## Production topology

```text
https://www.bjelectronics.shop   -> apps/store
https://admin.bjelectronics.shop -> apps/admin
both applications                -> shared PostgreSQL
```

The two applications are independent Node.js processes. Storefront routes never host administrator APIs, and administrator session cookies remain host-only on the admin origin.

## Hostinger application commands

Run all commands from the repository root.

### Store

```text
Install: npm ci --no-audit --no-fund
Preflight: npm run validate:store
Migration: npm run db:migrate
Build: npm run build:store
Start: npm run start:store
```

### Admin

```text
Install: npm ci --no-audit --no-fund
Preflight: npm run validate:admin
Migration: npm run db:migrate
Build: npm run build:admin
Start: npm run start:admin
```

The migration runner uses a PostgreSQL advisory lock so simultaneous store/admin deployments cannot apply migrations concurrently. Applied migration checksums are immutable.

## Health endpoints

Each application exposes three endpoints:

```text
/health       compatibility readiness endpoint
/health/live  process liveness; does not require dependencies
/health/ready dependency-aware readiness
```

Load balancers and uptime monitors should use `/health/live` for process availability and `/health/ready` for production traffic readiness.

## Required domain configuration

1. Bind `www.bjelectronics.shop` to the store Web App.
2. Bind `admin.bjelectronics.shop` to the admin Web App.
3. Redirect `https://bjelectronics.shop/*` to `https://www.bjelectronics.shop/*`.
4. Enable managed SSL for all attached hostnames.
5. Verify HTTP-to-HTTPS redirection before relying on HSTS.

## Administrator bootstrap

1. Configure `ADMIN_BOOTSTRAP_EMAILS` with the approved owner address.
2. Temporarily set `ALLOW_PUBLIC_SIGNUP=true`.
3. Deploy the admin application and create the owner account.
4. Confirm the account has `SUPER_ADMIN`.
5. Connect a second authentication method.
6. Set `ALLOW_PUBLIC_SIGNUP=false` and redeploy.

## OAuth callbacks

```text
Google:   https://admin.bjelectronics.shop/api/auth/oauth/google/callback
Facebook: https://admin.bjelectronics.shop/api/auth/oauth/facebook/callback
```

OAuth credentials belong only to the admin Web App environment.

## GitHub repository configuration

Variables:

```text
HOSTINGER_STORE_URL=https://www.bjelectronics.shop
HOSTINGER_ADMIN_URL=https://admin.bjelectronics.shop
HOSTINGER_APEX_URL=https://bjelectronics.shop
```

Optional secrets:

```text
HOSTINGER_STORE_DEPLOY_WEBHOOK_URL
HOSTINGER_ADMIN_DEPLOY_WEBHOOK_URL
```

The release workflow serializes production deployments and verifies store/admin routing, liveness, readiness, security headers, catalog access, admin isolation, and optional apex redirection.

## Definition of done

- Both applications deploy from the same reviewed `main` commit.
- Store and admin readiness endpoints return HTTP 200.
- Apex redirects to the canonical `www` store.
- Admin authentication works over HTTPS.
- Public signup is disabled after owner bootstrap.
- PostgreSQL backups and a restore test are complete.
- Store/admin deployment smoke tests pass.
- Rollback instructions and the previous healthy commit are recorded.
