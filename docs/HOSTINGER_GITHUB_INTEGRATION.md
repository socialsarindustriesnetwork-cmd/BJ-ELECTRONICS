# Hostinger and GitHub Integration

## Production targets

```text
Repository: socialsarindustriesnetwork-cmd/BJ-ELECTRONICS
Branch: main
Runtime: Node.js 22
Store: https://www.bjelectronics.shop
Admin: https://admin.bjelectronics.shop
Apex redirect: https://bjelectronics.shop -> https://www.bjelectronics.shop
```

Deploy two independent Hostinger managed Node.js Web Apps from the same repository. Keep each Web App working directory at the repository root so npm workspaces, shared packages, migrations, and `package-lock.json` remain available.

## Store application

```text
Workspace: apps/store
Install: npm ci --no-audit --no-fund
Preflight: npm run validate:store
Migration: npm run db:migrate
Build: npm run build:store
Start: npm run start:store
Liveness: https://www.bjelectronics.shop/health/live
Readiness: https://www.bjelectronics.shop/health/ready
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
RELEASE_SHA=<deployed-git-commit>
RELEASE_VERSION=1.0.0
RELEASE_DEPLOYED_AT=<ISO-8601-timestamp>
```

## Admin application

```text
Workspace: apps/admin
Install: npm ci --no-audit --no-fund
Preflight: npm run validate:admin
Migration: npm run db:migrate
Build: npm run build:admin
Start: npm run start:admin
Liveness: https://admin.bjelectronics.shop/health/live
Readiness: https://admin.bjelectronics.shop/health/ready
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
REALTIME_POLL_INTERVAL_MS=1500
ALLOW_PUBLIC_SIGNUP=true
ADMIN_BOOTSTRAP_EMAILS=owner@bjelectronics.shop
GOOGLE_CLIENT_ID=<optional-google-web-client-id>
GOOGLE_CLIENT_SECRET=<optional-google-client-secret>
FACEBOOK_CLIENT_ID=<optional-meta-app-id>
FACEBOOK_CLIENT_SECRET=<optional-meta-app-secret>
FACEBOOK_GRAPH_API_VERSION=<optional-vNN.N>
RELEASE_SHA=<deployed-git-commit>
RELEASE_VERSION=1.0.0
RELEASE_DEPLOYED_AT=<ISO-8601-timestamp>
```

After creating approved administrator accounts, set `ALLOW_PUBLIC_SIGNUP=false` and restart the admin Web App.

## OAuth callbacks

```text
Google: https://admin.bjelectronics.shop/api/auth/oauth/google/callback
Facebook: https://admin.bjelectronics.shop/api/auth/oauth/facebook/callback
```

Provider callback configuration must match the exact HTTPS origin and path.

## Domain binding

### Store

1. Bind `www.bjelectronics.shop` as primary.
2. Bind `bjelectronics.shop` as a redirecting alias.
3. Enable SSL for both hostnames.
4. Permanently redirect the apex hostname to `https://www.bjelectronics.shop`.

### Admin

1. Create the DNS record for `admin.bjelectronics.shop`.
2. Bind it only to the admin Node.js Web App.
3. Enable SSL.
4. Optionally redirect `www.admin.bjelectronics.shop` to `https://admin.bjelectronics.shop`.

## Direct Git integration

For each Hostinger Web App:

1. Connect GitHub and authorize repository access.
2. Select `socialsarindustriesnetwork-cmd/BJ-ELECTRONICS`.
3. Select `main`.
4. Enable automatic deployments.
5. Select Node.js 22.
6. Keep the working directory at `/`.
7. Configure the application-specific preflight, migration, build, and start commands.
8. Add environment variables without committing secrets.
9. Deploy and verify both liveness and readiness endpoints.

## GitHub release automation

The workflow `.github/workflows/hostinger-release.yml` verifies both deployments after CI succeeds on `main`.

Required repository variables:

```text
HOSTINGER_STORE_URL=https://www.bjelectronics.shop
HOSTINGER_ADMIN_URL=https://admin.bjelectronics.shop
HOSTINGER_APEX_URL=https://bjelectronics.shop
```

Optional secrets:

```text
HOSTINGER_STORE_DEPLOY_WEBHOOK_URL=<store-deployment-webhook>
HOSTINGER_ADMIN_DEPLOY_WEBHOOK_URL=<admin-deployment-webhook>
```

The release workflow fails when required targets are absent or do not match the canonical domains. It waits for deployment, checks liveness and readiness, validates the deployed release SHA, verifies the public storefront and cart, confirms storefront-to-admin separation, tests unauthenticated admin routing, checks security headers, and confirms the apex redirect.

Never commit database credentials, `AUTH_SECRET`, OAuth client secrets, or deployment webhooks.

## Expected health states

Store liveness:

```json
{
  "status": "alive",
  "service": "bj-electronics-store"
}
```

Store readiness:

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

Admin liveness:

```json
{
  "status": "alive",
  "service": "bj-electronics-admin"
}
```

Admin readiness:

```json
{
  "status": "healthy",
  "service": "bj-electronics-admin",
  "checks": {
    "authenticationDatabase": "up",
    "commerceDatabase": "up",
    "authenticationSecret": "configured",
    "realtimePublishing": "enabled"
  }
}
```

OAuth providers may be disabled without degrading the admin application. A configured provider must pass its production validation contract.
