# Hostinger and GitHub Integration

## Production target

- Repository: `socialsarindustriesnetwork-cmd/BJ-ELECTRONICS`
- Production branch: `main`
- Canonical origin: `https://www.bjelectronics.shop`
- Administration URL: `https://www.bjelectronics.shop/admin`
- Runtime: Node.js 22
- Install: `npm install --no-audit --no-fund`
- Database migration: `npm run db:migrate`
- Build: `npm run build`
- Start: `npm run start`
- Health endpoint: `/health`

## Hostinger environment variables

Configure these in the Hostinger Web App environment:

```env
NEXT_PUBLIC_APP_URL=https://www.bjelectronics.shop
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
AUTH_SECRET=<generated-secret>
DATABASE_URL=<production-postgresql-connection>
DB_POOL_MAX=10
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
ALLOW_PUBLIC_SIGNUP=true
```

After creating the initial administrator account, change `ALLOW_PUBLIC_SIGNUP` to `false`.

## Domain binding and canonical routing

1. Bind `bjelectronics.shop` to the Hostinger Web App.
2. Add `www.bjelectronics.shop` and select it as the primary hostname.
3. Enable SSL for both root and `www` hostnames.
4. Configure the root hostname to redirect to `https://www.bjelectronics.shop`.
5. When the previous misspelled domain is owned, bind `bjelecteonics.shop` and `www.bjelecteonics.shop` as aliases so the application can permanently redirect them to the corrected hostname.
6. Verify `/` redirects to `/admin`.
7. Verify unauthenticated `/admin` redirects to `/sign-in?next=%2Fadmin`.

The application also enforces these canonical-host redirects at the Next.js layer. DNS and Hostinger domain bindings are still required for requests to reach the application.

## Direct Git integration

1. In Hostinger hPanel, open the deployed Web App.
2. Connect GitHub and select `socialsarindustriesnetwork-cmd/BJ-ELECTRONICS`.
3. Select `main`.
4. Enable automatic deployment when `main` changes.
5. Configure Node.js 22 and the commands above.
6. Run the authentication migration before starting the first production release.
7. Connect the custom domain and verify SSL for root and `www`.

## GitHub release automation

The repository includes `.github/workflows/hostinger-release.yml`.

Configure the GitHub repository variable:

```text
HOSTINGER_PRODUCTION_URL=https://www.bjelectronics.shop
```

When Hostinger supplies a deployment webhook, configure it as this GitHub Actions secret:

```text
HOSTINGER_DEPLOY_WEBHOOK_URL=<secret-webhook-url>
```

The workflow:

1. Waits for CI to pass on `main`.
2. Calls the optional deployment webhook.
3. Otherwise relies on Hostinger Git auto-deploy.
4. Polls `/health`.
5. Verifies `/` redirects to `/admin`.
6. Verifies unauthenticated `/admin` redirects to `/sign-in`.
7. Fails when production health or routing is incorrect.

Do not place database credentials, `AUTH_SECRET`, or deployment webhooks in repository files.

## Expected health response

A healthy response requires PostgreSQL connectivity, `AUTH_SECRET`, and the application runtime:

```json
{
  "status": "healthy",
  "checks": {
    "database": "up",
    "authenticationSecret": "configured"
  }
}
```
