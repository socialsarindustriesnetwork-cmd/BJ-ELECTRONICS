# Authentication Architecture

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

## Roles

- `SUPER_ADMIN`
- `ADMIN`
- `MANAGER`
- `STAFF`
- `VIEWER`

The first active account receives `SUPER_ADMIN`. Later public registrations receive `STAFF`. Disable public registration after bootstrap by setting:

```env
ALLOW_PUBLIC_SIGNUP=false
```

Future staff onboarding should use invitations created by an authorized administrator.

## Required runtime configuration

```env
NEXT_PUBLIC_APP_URL=https://www.bjelecteonics.shop
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
4. Open `/sign-up`.
5. Create the initial owner account.
6. Confirm the account receives `SUPER_ADMIN`.
7. Set `ALLOW_PUBLIC_SIGNUP=false`.
8. Redeploy or restart the app.

## Security limitations scheduled next

- Email verification
- Password reset email delivery
- Multi-factor authentication
- Administrator invitation workflow
- Session/device management UI
- Fine-grained permission editor
- Security-event alerts
