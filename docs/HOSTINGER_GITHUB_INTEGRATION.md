# Hostinger and GitHub Integration

## Production targets

```text
Repository: socialsarindustriesnetwork-cmd/BJ-ELECTRONICS
Branch: main
Runtime: Node.js 22
Store: https://www.bjelectronics.shop
Admin: https://admin.bjelectronics.shop
```

Deploy two independent Hostinger Node.js Web Apps from the same repository. Both applications use the same PostgreSQL database and deploy automatically from `main`.

## Store application

```text
Workspace: apps/store
Install: npm install --no-audit --no-fund
Migration: npm run db:migrate
Build: npm run build:store
Start: npm run start:store
Health: https://www.bjelectronics.shop/health
```

Store environment:

```env
NEXT_PUBLIC_STORE_URL=https://www.bjelectronics.shop
NEXT_PUBLIC_ADMIN_URL=https://admin.bjelectronics.shop
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
DATABASE_URL=<shared-production-postgresql-connection>
DB_POOL_MAX=10
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
REALTIME_POLL_INTERVAL_MS=1500
```

## Admin application

```text
Workspace: apps/admin
Install: npm install --no-audit --no-fund
Migration: npm run db:migrate
Build: npm run build:admin
Start: npm run start:admin
Health: https://admin.bjelectronics.shop/health
```

Admin environment:

```env
NEXT_PUBLIC_APP_URL=https://admin.bjelectronics.shop
NEXT_PUBLIC_ADMIN_URL=https://admin.bjelectronics.shop
NEXT_PUBLIC_STORE_URL=https://www.bjelectronics.shop
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
AUTH_SECRET=<generated-secret>
DATABASE_URL=<shared-production-postgresql-connection>
DB_POOL_MAX=10
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
ALLOW_PUBLIC_SIGNUP=true
ADMIN_BOOTSTRAP_EMAILS=owner@bjelectronics.shop
GOOGLE_CLIENT_ID=<optional-google-web-client-id>
GOOGLE_CLIENT_SECRET=<optional-google-client-secret>
FACEBOOK_CLIENT_ID=<optional-meta-app-id>
FACEBOOK_CLIENT_SECRET=<optional-meta-app-secret>
FACEBOOK_GRAPH_API_VERSION=<configured-version>
```

After creating approved accounts, set `ALLOW_PUBLIC_SIGNUP=false`.

## OAuth callbacks

```text
Google:
https://admin.bjelectronics.shop/api/auth/oauth/google/callback

Facebook:
https://admin.bjelectronics.shop/api/auth/oauth/facebook/callback
```

Provider callback configuration must match the exact HTTPS origin and path.

## Domain binding

### Store

1. Bind `www.bjelectronics.shop` as primary.
2. Bind `bjelectronics.shop` as a redirecting alias.
3. Enable SSL for both hostnames.
4. Redirect the apex hostname to `https://www.bjelectronics.shop`.

### Admin

1. Create the DNS record for `admin.bjelectronics.shop`.
2. Bind it to the admin Node.js Web App.
3. Enable SSL.
4. Optionally bind `www.admin.bjelectronics.shop` as a redirecting alias.

`www.bjelectronics.shop-admin` is not a valid public deployment target because `.shop-admin` is not a delegated top-level domain.

## Direct Git integration

For each Hostinger Web App:

1. Connect GitHub.
2. Select `socialsarindustriesnetwork-cmd/BJ-ELECTRONICS`.
3. Select `main`.
4. Enable automatic deployments.
5. Use Node.js 22.
6. Configure the app-specific build and start commands.
7. Add environment variables without committing secrets.
8. Deploy and verify the application health endpoint.

## GitHub release automation

The repository workflow `.github/workflows/hostinger-release.yml` can trigger and verify both deployments.

Repository variables:

```text
HOSTINGER_STORE_URL=https://www.bjelectronics.shop
HOSTINGER_ADMIN_URL=https://admin.bjelectronics.shop
```

Optional secrets:

```text
HOSTINGER_STORE_DEPLOY_WEBHOOK_URL=<store-deployment-webhook>
HOSTINGER_ADMIN_DEPLOY_WEBHOOK_URL=<admin-deployment-webhook>
```

The release workflow waits for CI, calls each optional webhook, checks both `/health` endpoints, validates the public store, confirms store-to-admin separation, and confirms unauthenticated admin access redirects to sign-in.

Never commit database credentials, `AUTH_SECRET`, OAuth client secrets, or deployment webhooks.

## Expected health states

Store:

```json
{
  "status": "healthy",
  "service": "bj-electronics-store",
  "checks": {
    "database": "up",
    "realtime": "enabled"
  }
}
```

Admin:

```json
{
  "status": "healthy",
  "service": "bj-electronics-admin",
  "checks": {
    "authenticationDatabase": "up",
    "commerceDatabase": "up",
    "authenticationSecret": "configured",
    "oauth": {
      "google": "configured",
      "facebook": "configured"
    },
    "realtimePublishing": "enabled"
  }
}
```

OAuth providers may be `disabled` without degrading the admin app. Facebook becomes `misconfigured` when credentials exist but the configured Graph API version is invalid or missing.
