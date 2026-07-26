# Hostinger Production Deployment

BJ Electronics deploys as two isolated Hostinger managed Node.js Web Apps from the same GitHub repository and `main` branch.

## Canonical production targets

| Application | Domain | Workspace |
| --- | --- | --- |
| Public storefront | `https://www.bjelectronics.shop` | `apps/store` |
| Secure administration | `https://admin.bjelectronics.shop` | `apps/admin` |
| Apex redirect alias | `https://bjelectronics.shop` | Redirects to the storefront |

Both applications use Node.js 22, npm workspaces, the repository-root lockfile, and the same production PostgreSQL database.

## Required repository configuration

Create these GitHub repository variables:

```text
HOSTINGER_STORE_URL=https://www.bjelectronics.shop
HOSTINGER_ADMIN_URL=https://admin.bjelectronics.shop
HOSTINGER_APEX_URL=https://bjelectronics.shop
```

Optional deployment webhook secrets:

```text
HOSTINGER_STORE_DEPLOY_WEBHOOK_URL=<store-webhook>
HOSTINGER_ADMIN_DEPLOY_WEBHOOK_URL=<admin-webhook>
```

The release workflow fails closed when canonical target variables are missing or incorrect. It also requires each deployed health response to expose the expected Git commit.

## Store Web App

Configure the first Hostinger Node.js Web App as follows:

```text
Repository: socialsarindustriesnetwork-cmd/BJ-ELECTRONICS
Branch: main
Repository working directory: /
Node.js: 22
Install command: npm ci --no-audit --no-fund
Environment preflight: npm run validate:store
Migration command: npm run db:migrate
Build command: npm run build:store
Start command: npm run start:store
Primary domain: www.bjelectronics.shop
Readiness endpoint: /health/ready
Liveness endpoint: /health/live
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

## Admin Web App

Configure the second Hostinger Node.js Web App as follows:

```text
Repository: socialsarindustriesnetwork-cmd/BJ-ELECTRONICS
Branch: main
Repository working directory: /
Node.js: 22
Install command: npm ci --no-audit --no-fund
Environment preflight: npm run validate:admin
Migration command: npm run db:migrate
Build command: npm run build:admin
Start command: npm run start:admin
Primary domain: admin.bjelectronics.shop
Readiness endpoint: /health/ready
Liveness endpoint: /health/live
```

Admin environment:

```env
NEXT_PUBLIC_APP_URL=https://admin.bjelectronics.shop
NEXT_PUBLIC_ADMIN_URL=https://admin.bjelectronics.shop
NEXT_PUBLIC_STORE_URL=https://www.bjelectronics.shop
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
AUTH_SECRET=<generated-secret-with-at-least-32-characters>
DATABASE_URL=<shared-production-postgresql-connection>
DB_POOL_MAX=10
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
REALTIME_POLL_INTERVAL_MS=1500
ALLOW_PUBLIC_SIGNUP=true
ADMIN_BOOTSTRAP_EMAILS=owner@bjelectronics.shop
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
FACEBOOK_CLIENT_ID=<optional>
FACEBOOK_CLIENT_SECRET=<optional>
FACEBOOK_GRAPH_API_VERSION=<optional-vNN.N>
RELEASE_SHA=<deployed-git-commit>
RELEASE_VERSION=1.0.0
RELEASE_DEPLOYED_AT=<ISO-8601-timestamp>
```

After the approved owner account is created, set `ALLOW_PUBLIC_SIGNUP=false` and restart the admin application.

## Domain and SSL configuration

1. Bind `www.bjelectronics.shop` to the store Web App and make it primary.
2. Bind `bjelectronics.shop` as an alias and redirect it permanently to `https://www.bjelectronics.shop`.
3. Create the `admin` DNS record and bind `admin.bjelectronics.shop` to the admin Web App.
4. Enable SSL for all three hostnames.
5. Do not route the administration application through the public storefront origin.

## Verification

Run the repository quality gate before deployment:

```bash
npm ci --no-audit --no-fund
npm run quality
```

After deployment, run the production verifier:

```bash
HOSTINGER_STORE_URL=https://www.bjelectronics.shop \
HOSTINGER_ADMIN_URL=https://admin.bjelectronics.shop \
APEX_STORE_URL=https://bjelectronics.shop \
REQUIRE_RELEASE_MATCH=true \
EXPECTED_RELEASE_SHA=<deployed-git-commit> \
node scripts/check-production.mjs
```

The verifier checks:

- storefront and admin liveness and readiness;
- release commit identity;
- HTTPS security headers;
- storefront catalog and cart APIs;
- secure cart-cookie attributes;
- cart and checkout pages;
- storefront-to-admin isolation;
- unauthenticated admin redirects;
- admin no-index and no-store controls;
- apex-to-`www` redirection.

Production verification is not complete until both applications are healthy, the apex redirect is correct, SSL is active, and the deployed release SHA matches the approved Git commit.
