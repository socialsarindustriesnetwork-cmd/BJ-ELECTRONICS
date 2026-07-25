# Authentication Architecture

## Isolated administration origin

```text
Store: https://www.bjelectronics.shop
Admin dashboard: https://admin.bjelectronics.shop
Sign in: https://admin.bjelectronics.shop/sign-in
Account security: https://admin.bjelectronics.shop/admin/security
```

The public store does not serve administration pages or authentication APIs. Requests to legacy store administration paths redirect to the isolated admin origin.

Admin routing rules:

- `/` requires a valid server-side administrator session.
- Unauthenticated `/` requests redirect to `/sign-in?next=%2Fadmin`.
- `/admin` is a compatibility callback path that redirects to `/` after authentication.
- `/admin/security` manages connected sign-in methods.
- Authentication callback destinations are restricted to local administrator routes.
- Admin and authentication responses use private no-store and noindex headers.

## Supported authentication methods

- Email and password
- Google / Gmail through OAuth 2.0 authorization code flow
- Facebook through Facebook Login
- Connected-provider management at `/admin/security`

A social provider is displayed only when its client ID and secret are configured. Provider access and refresh tokens are never persisted. The database stores only the stable provider account identifier and non-sensitive profile metadata.

## Implemented security controls

- bcrypt password hashing with cost factor 12
- Opaque 256-bit application session tokens
- SHA-256 session-token hashes stored in PostgreSQL
- HTTP-only, secure, SameSite=Lax cookies scoped to the admin hostname
- Server-side session expiration and revocation
- Per-email and per-IP password authentication limits
- OAuth state verification and ten-minute transaction expiry
- Google PKCE with SHA-256 code challenges
- Exact provider callback URLs derived from the admin origin
- Google verified-email enforcement and stable `sub` identity mapping
- Facebook access-token debugging, app-ID validation, user-ID matching, and app-secret proof
- Provider account uniqueness and collision protection
- Safe account linking and unlinking
- Prevention of removing the final available sign-in method
- Same-origin request validation for mutations
- Authentication audit events
- User suspension and role enforcement
- Administration-domain CSP, no-store, and noindex headers

## Roles and owner bootstrap

```text
SUPER_ADMIN
ADMIN
MANAGER
STAFF
VIEWER
```

The first approved active account receives `SUPER_ADMIN`. Later registrations receive `STAFF`.

Configure the owner allowlist before opening registration:

```env
ADMIN_BOOTSTRAP_EMAILS=owner@bjelectronics.shop
ALLOW_PUBLIC_SIGNUP=true
```

After the owner account is created and verified:

```env
ALLOW_PUBLIC_SIGNUP=false
```

Existing password and linked-provider accounts can still sign in after public signup is disabled.

## Required admin runtime configuration

```env
NEXT_PUBLIC_APP_URL=https://admin.bjelectronics.shop
NEXT_PUBLIC_ADMIN_URL=https://admin.bjelectronics.shop
NEXT_PUBLIC_STORE_URL=https://www.bjelectronics.shop
AUTH_SECRET=<at-least-32-random-characters>
DATABASE_URL=postgresql://user:password@host:5432/bj_electronics
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
ALLOW_PUBLIC_SIGNUP=true
ADMIN_BOOTSTRAP_EMAILS=owner@bjelectronics.shop
```

Generate the session and OAuth transaction secret with:

```bash
openssl rand -base64 48
```

## Google / Gmail configuration

Create a Google OAuth web application and register this exact authorized redirect URI:

```text
https://admin.bjelectronics.shop/api/auth/oauth/google/callback
```

Admin environment:

```env
GOOGLE_CLIENT_ID=<google-web-client-id>
GOOGLE_CLIENT_SECRET=<google-web-client-secret>
```

The application requests only `openid`, `email`, and `profile`. Google identities must return a verified email address.

## Facebook configuration

Configure Facebook Login and add this exact valid OAuth redirect URI:

```text
https://admin.bjelectronics.shop/api/auth/oauth/facebook/callback
```

Admin environment:

```env
FACEBOOK_CLIENT_ID=<meta-app-id>
FACEBOOK_CLIENT_SECRET=<meta-app-secret>
FACEBOOK_GRAPH_API_VERSION=<version-configured-in-meta-app>
```

Facebook must grant `email` and `public_profile`. Accounts that do not return an email address cannot be provisioned automatically.

## Database initialization

Run all authentication and commerce migrations before enabling the release:

```bash
npm run db:migrate
```

Authentication tables:

- `auth_users`
- `auth_sessions`
- `auth_accounts`
- `auth_attempts`
- `auth_audit_log`
- `schema_migrations`

`auth_accounts` stores provider identity keys and non-sensitive profile metadata, never OAuth access tokens or client secrets.

## Production activation sequence

1. Configure the shared PostgreSQL database, `AUTH_SECRET`, and `ADMIN_BOOTSTRAP_EMAILS` on the admin application.
2. Configure Google and/or Facebook credentials.
3. Register the exact admin-domain callback URLs.
4. Run `npm run db:migrate`.
5. Deploy `apps/admin` at `admin.bjelectronics.shop`.
6. Open `https://admin.bjelectronics.shop/sign-up`.
7. Create or authorize the approved owner account.
8. Confirm `SUPER_ADMIN` access at `https://admin.bjelectronics.shop`.
9. Open `/admin/security` and connect a second sign-in method.
10. Set `ALLOW_PUBLIC_SIGNUP=false`.
11. Restart or redeploy the admin application.

## Scheduled security extensions

- Transactional email verification for local password accounts
- Password reset email delivery
- Multi-factor authentication and recovery codes
- Administrator invitation workflow
- Active-device and session management
- Fine-grained permission editor
- Security-event notifications
