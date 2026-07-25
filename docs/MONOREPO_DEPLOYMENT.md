# Store and Admin Monorepo Deployment

## Canonical production topology

```text
Public store: https://www.bjelectronics.shop
Admin portal: https://admin.bjelectronics.shop
Shared database: PostgreSQL
Shared source: socialsarindustriesnetwork-cmd/BJ-ELECTRONICS
Production branch: main
```

The requested hostname `www.bjelectronics.shop-admin` cannot be used because `.shop-admin` is not a delegated public top-level domain. `admin.bjelectronics.shop` is the valid, secure, and conventional administration hostname.

## Repository layout

```text
apps/store              Public Next.js application
apps/admin              Private Next.js application
packages/config         Domain configuration
packages/database       Shared PostgreSQL repositories
packages/realtime       Event synchronization contract
packages/ui             Shared visual identity
```

The legacy root application source remains temporarily available to the admin workspace for authentication compatibility. Root build scripts compile only the two workspace applications.

## Hostinger Web App 1 — Store

Create a Node.js Web App connected to the repository and `main` branch.

```text
Working directory: repository root
Node.js: 22
Install: npm install --no-audit --no-fund
Migration: npm run db:migrate
Build: npm run build:store
Start: npm run start:store
Health path: /health
```

Store environment:

```env
NEXT_PUBLIC_STORE_URL=https://www.bjelectronics.shop
NEXT_PUBLIC_ADMIN_URL=https://admin.bjelectronics.shop
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
DATABASE_URL=<shared-production-postgresql-url>
DB_POOL_MAX=10
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
REALTIME_POLL_INTERVAL_MS=1500
```

Attach these domains:

```text
Primary: www.bjelectronics.shop
Redirect alias: bjelectronics.shop → https://www.bjelectronics.shop
```

## Hostinger Web App 2 — Admin

Create a second Node.js Web App connected to the same repository and branch.

```text
Working directory: repository root
Node.js: 22
Install: npm install --no-audit --no-fund
Migration: npm run db:migrate
Build: npm run build:admin
Start: npm run start:admin
Health path: /health
```

Admin environment:

```env
NEXT_PUBLIC_APP_URL=https://admin.bjelectronics.shop
NEXT_PUBLIC_ADMIN_URL=https://admin.bjelectronics.shop
NEXT_PUBLIC_STORE_URL=https://www.bjelectronics.shop
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
AUTH_SECRET=<at-least-32-random-characters>
DATABASE_URL=<shared-production-postgresql-url>
DB_POOL_MAX=10
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
ALLOW_PUBLIC_SIGNUP=true
ADMIN_BOOTSTRAP_EMAILS=<approved-owner-email>
GOOGLE_CLIENT_ID=<optional-google-client-id>
GOOGLE_CLIENT_SECRET=<optional-google-client-secret>
FACEBOOK_CLIENT_ID=<optional-meta-app-id>
FACEBOOK_CLIENT_SECRET=<optional-meta-app-secret>
FACEBOOK_GRAPH_API_VERSION=<configured-version>
```

Attach this domain:

```text
Primary: admin.bjelectronics.shop
Optional redirect alias: www.admin.bjelectronics.shop
```

## OAuth callback migration

Update provider consoles to the isolated admin hostname.

```text
Google:
https://admin.bjelectronics.shop/api/auth/oauth/google/callback

Facebook:
https://admin.bjelectronics.shop/api/auth/oauth/facebook/callback
```

Remove obsolete callbacks only after the new admin deployment has been verified.

## Realtime synchronization model

1. An authorized administrator creates, updates, publishes, or archives a product.
2. The admin API performs the product mutation and event insertion in one PostgreSQL transaction.
3. `commerce_events` stores the durable ordered event.
4. Storefront clients connect to `https://www.bjelectronics.shop/api/realtime` using Server-Sent Events.
5. The storefront refreshes catalog data when a new event arrives.
6. A reconnecting client resumes from its last event identifier.

This design avoids storing provider tokens, does not depend on in-memory process state, and continues working after application restarts.

## First production activation

1. Create or select the shared PostgreSQL database.
2. Add environment variables to both Hostinger applications.
3. Run `npm run db:migrate` once; rerunning is safe.
4. Deploy the store and verify `/health`.
5. Deploy the admin app and verify `/health`.
6. Register the admin OAuth callback URLs.
7. Create the approved first owner account.
8. Confirm `SUPER_ADMIN` access.
9. Create or edit a product and confirm the storefront updates.
10. Set `ALLOW_PUBLIC_SIGNUP=false` and restart the admin application.

## DNS and TLS verification

Verify all of the following:

```text
https://bjelectronics.shop redirects to https://www.bjelectronics.shop
https://www.bjelectronics.shop returns the store
https://admin.bjelectronics.shop returns the protected admin portal
Both /health endpoints return HTTP 200
Both certificates include the exact attached hostnames
The store /admin route redirects to the admin subdomain
Admin pages return no-store and noindex headers
```

## GitHub deployment variables

Configure repository variables:

```text
HOSTINGER_STORE_URL=https://www.bjelectronics.shop
HOSTINGER_ADMIN_URL=https://admin.bjelectronics.shop
```

Optional repository secrets:

```text
HOSTINGER_STORE_DEPLOY_WEBHOOK_URL=<store-webhook>
HOSTINGER_ADMIN_DEPLOY_WEBHOOK_URL=<admin-webhook>
```

Never commit database credentials, OAuth secrets, `AUTH_SECRET`, or deployment webhooks.
