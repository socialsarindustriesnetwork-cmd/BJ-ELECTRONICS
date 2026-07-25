# Hostinger and GitHub Integration

## Production target

- Repository: `socialsarindustriesnetwork-cmd/BJ-ELECTRONICS`
- Production branch: `main`
- Store URL: `https://bjelectronics.shop`
- Administration URL: `https://bjelectronics.shop/admin`
- Account security URL: `https://bjelectronics.shop/admin/security`
- Runtime: Node.js 22
- Install: `npm install --no-audit --no-fund`
- Database migration: `npm run db:migrate`
- Build: `npm run build`
- Start: `npm run start`
- Health endpoint: `/health`

## Hostinger environment variables

Configure these in the Hostinger Web App environment:

```env
NEXT_PUBLIC_APP_URL=https://bjelectronics.shop
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
AUTH_SECRET=<generated-secret>
DATABASE_URL=<production-postgresql-connection>
DB_POOL_MAX=10
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
ALLOW_PUBLIC_SIGNUP=true
ADMIN_BOOTSTRAP_EMAILS=owner@bjelectronics.shop

GOOGLE_CLIENT_ID=<google-web-client-id>
GOOGLE_CLIENT_SECRET=<google-web-client-secret>

FACEBOOK_CLIENT_ID=<meta-app-id>
FACEBOOK_CLIENT_SECRET=<meta-app-secret>
FACEBOOK_GRAPH_API_VERSION=<version-configured-in-meta-app>
```

Provider variables are optional as complete pairs. The sign-in interface displays only correctly configured providers. After creating the owner and any approved staff accounts, change `ALLOW_PUBLIC_SIGNUP` to `false`.

## Provider callback registration

Register these exact HTTPS callback URLs:

```text
Google:
https://bjelectronics.shop/api/auth/oauth/google/callback

Facebook:
https://bjelectronics.shop/api/auth/oauth/facebook/callback
```

The scheme, hostname, path, and trailing-slash behavior must match the provider configuration exactly.

## Domain binding and canonical routing

1. Bind `bjelectronics.shop` to the Hostinger Web App.
2. Set `bjelectronics.shop` as the primary hostname.
3. Add `www.bjelectronics.shop` as an alias.
4. Enable SSL for both apex and `www` hostnames.
5. Redirect `www.bjelectronics.shop` to `https://bjelectronics.shop`.
6. Bind owned legacy misspelled hostnames as redirecting aliases.
7. Verify `/` renders the public storefront.
8. Verify unauthenticated `/admin` redirects to `/sign-in?next=%2Fadmin`.
9. Verify `/admin/security` requires authentication.

The application also enforces canonical-host redirects at the Next.js layer. DNS and Hostinger bindings are still required for requests to reach the application.

## Direct Git integration

1. In Hostinger hPanel, open the deployed Web App.
2. Connect GitHub and select `socialsarindustriesnetwork-cmd/BJ-ELECTRONICS`.
3. Select `main`.
4. Enable automatic deployment when `main` changes.
5. Configure Node.js 22 and the commands above.
6. Add the production environment variables without committing secrets.
7. Run `npm run db:migrate` before the first OAuth-enabled release.
8. Deploy, verify `/health`, then test each configured provider.
9. Create the approved owner and confirm `SUPER_ADMIN` access.
10. Disable public signup and restart the application.

## GitHub release automation

The repository includes `.github/workflows/hostinger-release.yml`.

Configure the repository variable:

```text
HOSTINGER_PRODUCTION_URL=https://bjelectronics.shop
```

When Hostinger supplies a deployment webhook, configure this GitHub Actions secret:

```text
HOSTINGER_DEPLOY_WEBHOOK_URL=<secret-webhook-url>
```

The workflow:

1. Waits for CI to pass on `main`.
2. Calls the optional deployment webhook.
3. Otherwise relies on Hostinger Git auto-deploy.
4. Polls `/health`.
5. Verifies `/` renders the public store.
6. Verifies unauthenticated `/admin` redirects to `/sign-in`.
7. Fails when production health or routing is incorrect.

Never commit database credentials, `AUTH_SECRET`, OAuth client secrets, or deployment webhooks.

## Expected health response

A healthy response requires PostgreSQL connectivity, a valid `AUTH_SECRET`, and no malformed provider configuration:

```json
{
  "status": "healthy",
  "checks": {
    "database": "up",
    "authenticationSecret": "configured",
    "oauth": {
      "google": "configured",
      "facebook": "configured"
    }
  }
}
```

A provider may report `disabled` without degrading the application. Facebook reports `misconfigured` when credentials exist but `FACEBOOK_GRAPH_API_VERSION` is invalid or missing.
