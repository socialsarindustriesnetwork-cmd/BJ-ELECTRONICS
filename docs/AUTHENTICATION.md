# Authentication Architecture

## Protected administration route

The canonical administration dashboard is:

```text
https://bjelectronics.shop/admin
```

Routing rules:

- `/` is the public BJ Electronics storefront.
- `/admin` is rendered only after a valid server-side session is resolved.
- Unauthenticated `/admin` requests redirect to `/sign-in?next=%2Fadmin`.
- Sign-in callback destinations are restricted to local `/admin` paths to prevent open redirects.
- Authenticated users visiting `/sign-in` or `/sign-up` are returned to `/admin`.
- Legacy `/dashboard` routes permanently redirect to `/admin`.
- `www.bjelectronics.shop` permanently redirects to the apex domain.

## Implemented controls

- Email/password sign-in and account creation
- bcrypt password hashing with cost factor 12
- Opaque 256-bit session tokens
- Only SHA-256 session-token hashes are stored in PostgreSQL
- HTTP-only, secure, SameSite=Lax cookies
- Database-backed session revocation and expiration
- Per-identifier and per-IP authentication attempt limits
- Same-origin and JSON request validation
- User status and role enforcement scaffolding
- Authentication audit events
- Protected server-rendered dashboard
- First-account super administrator bootstrap
- Configurable public signup
- No-store and no-index response headers on `/admin`, `/sign-in`, and `/sign-up`

## Roles

- `SUPER_ADMIN`
- `ADMIN`
- `MANAGER`
- `STAFF`
- `VIEWER`

The first active account receives `SUPER_ADMIN`. Later public registrations receive `STAFF`. Disable public registration after bootstrap:

```env
ALLOW_PUBLIC_SIGNUP=false
```

Future staff onboarding should use invitations created by an authorized administrator.

## Required runtime configuration

```env
NEXT_PUBLIC_APP_URL=https://bjelectronics.shop
AUTH_SECRET=<at-least-32-random-characters>
DATABASE_URL=postgresql://user:password@host:5432/bj_electronics
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
ALLOW_PUBLIC_SIGNUP=true
```

Generate a secret with:

```bash
openssl rand -base64 48
```

## Database initialization

Run migrations before using sign-in or signup:

```bash
npm run db:migrate
```

The migration creates:

- `auth_users`
- `auth_sessions`
- `auth_attempts`
- `auth_audit_log`
- `schema_migrations`

## Bootstrap sequence

1. Configure the production database and `AUTH_SECRET`.
2. Run `npm run db:migrate`.
3. Deploy the application.
4. Open `https://bjelectronics.shop/sign-up`.
5. Create the initial owner account.
6. Confirm access to `https://bjelectronics.shop/admin`.
7. Confirm the account receives `SUPER_ADMIN`.
8. Set `ALLOW_PUBLIC_SIGNUP=false`.
9. Redeploy or restart the app.

## Security extensions scheduled next

- Email verification
- Password reset email delivery
- Multi-factor authentication
- Administrator invitation workflow
- Session/device management UI
- Fine-grained permission editor
- Security-event alerts
