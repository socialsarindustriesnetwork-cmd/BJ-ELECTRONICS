# Hostinger Production Deployment

This application is prepared for deployment through Hostinger managed Node.js Web App hosting.

## Production target

- Repository: `socialsarindustriesnetwork-cmd/BJ-ELECTRONICS`
- Branch: `main`
- Framework: Next.js
- Node.js: 22
- Install command: `npm install --no-audit --no-fund`
- Migration command: `npm run db:migrate`
- Build command: `npm run build`
- Start command: `npm run start`
- Health endpoint: `/health`
- Store domain: `bjelectronics.shop`
- Protected admin route: `/admin`

## hPanel connection

1. Open **Websites → Add Website → Deploy Web App / Node.js Web App**.
2. Select **Import Git Repository**.
3. Authorize Hostinger to access GitHub.
4. Select `socialsarindustriesnetwork-cmd/BJ-ELECTRONICS`.
5. Select the `main` branch.
6. Confirm **Next.js**, Node.js **22**, and npm.
7. Configure install, migration, build, and start commands.
8. Add the production environment variables.
9. Deploy to the temporary Hostinger hostname.
10. Verify `/health` returns `status: healthy`.
11. Bind `bjelectronics.shop` and `www.bjelectronics.shop`.
12. Set `bjelectronics.shop` as the primary hostname.
13. Configure `www.bjelectronics.shop` to redirect to the apex domain.
14. Enable SSL for both hostnames.
15. Verify `https://bjelectronics.shop/` renders the public storefront.
16. Verify an unauthenticated `/admin` request redirects to `/sign-in`.

## Production environment variables

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
```

After creating the first owner account, set `ALLOW_PUBLIC_SIGNUP=false` and restart the app.

## Verification checklist

- Deployment completes successfully.
- `/health` returns HTTP 200 and `status: healthy`.
- `/` renders the public BJ Electronics storefront.
- `/admin` is never served without a valid session.
- Unauthenticated `/admin` redirects to `/sign-in?next=%2Fadmin`.
- Light and dark logos load from `/brand/`.
- Mobile storefront and admin navigation work at narrow widths.
- HTTPS works without certificate warnings.
- `www.bjelectronics.shop` redirects to `bjelectronics.shop`.
- Hostinger automatic deployment is enabled for updates to `main`.

## Security note

Do not store customer, payment, order, or inventory data until the production database, authentication secret, migration, first-owner bootstrap, and signup lock-down have been completed.
