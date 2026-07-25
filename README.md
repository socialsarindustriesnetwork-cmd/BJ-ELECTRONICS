# BJ Electronics Commerce Platform

Responsive BJ Electronics storefront and secure administration application.

## Current foundation

- Public responsive storefront shell at `/`
- Protected administration dashboard at `/admin`
- Next.js App Router and strict TypeScript
- Official BJ Electronics brand assets
- Light and dark administration themes
- PostgreSQL-backed email/password authentication
- Secure password hashing and revocable server-side sessions
- Role and audit-log scaffolding
- Canonical production origin `https://bjelectronics.shop`
- Hostinger managed Node.js deployment configuration
- GitHub CI, dependency updates, and production release verification

## Application routes

```text
/             Public BJ Electronics storefront
/admin        Protected administration dashboard
/sign-in      Secure administrator sign-in
/sign-up      Initial owner bootstrap or controlled staff registration
/health       Runtime, database, and authentication-secret health check
```

Unauthenticated requests to `/admin` are redirected to `/sign-in?next=%2Fadmin`. Authentication callbacks only accept local `/admin` destinations. `www.bjelectronics.shop` and legacy misspelled hostnames permanently redirect to `bjelectronics.shop`.

## Development

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Authentication bootstrap

1. Configure `DATABASE_URL` and a strong `AUTH_SECRET`.
2. Run `npm run db:migrate`.
3. Open `/sign-up`.
4. Create the first account; it becomes `SUPER_ADMIN`.
5. Set `ALLOW_PUBLIC_SIGNUP=false` after bootstrap.

See `docs/AUTHENTICATION.md`.

## Production deployment

The application is prepared for Hostinger managed Node.js Web App hosting from `main`.

```text
Store URL: https://bjelectronics.shop
Admin URL: https://bjelectronics.shop/admin
Node.js: 22
Install: npm install --no-audit --no-fund
Migration: npm run db:migrate
Build: npm run build
Start: npm run start
Health: /health
```

See `docs/HOSTINGER_GITHUB_INTEGRATION.md`.

## Brand directories

- Canonical source: `assets/brand/source/`
- Runtime logos: `public/brand/logos/`
- App and browser icons: `public/brand/icons/`
- Social previews: `public/brand/social/`
- Store and repository banners: `public/brand/banners/`
- Asset index: `public/brand/brand-assets.json`
