# Authentication Architecture

## Protected administration route

```text
Store: https://bjelectronics.shop
Admin: https://bjelectronics.shop/admin
Security: https://bjelectronics.shop/admin/security
```

Routing rules:

- `/` is the public BJ Electronics storefront.
- `/admin` and `/admin/*` require a valid server-side session.
- Unauthenticated `/admin` requests redirect to `/sign-in?next=%2Fadmin`.
- Authentication callback destinations are restricted to local `/admin` paths.
- Authenticated users visiting `/sign-in` or `/sign-up` are returned to `/admin`.
- Legacy `/dashboard` routes permanently redirect to `/admin`.
- `www.bjelectronics.shop` and legacy misspelled hostnames redirect to the apex domain.

## Supported authentication methods

- Email and password
- Google / Gmail account through OAuth 2.0 authorization code flow
- Facebook account through Facebook Login
- Connected-provider management at `/admin/security`

A social provider is shown only when its client ID and secret are configured. Provider access and refresh tokens are not persisted; only the stable provider account identifier and non-sensitive profile metadata are stored.

## Implemented security controls

- bcrypt password hashing with cost factor 12
- Opaque 256-bit application session tokens
- SHA-256 session-token hashes stored in PostgreSQL
- HTTP-only, secure, SameSite=Lax cookies
- Server-side session expiration and revocation
- Per-email and per-IP password authentication limits
- OAuth state verification and ten-minute transaction expiry
- Google PKCE with SHA-256 code challenges
- Exact provider callback URLs derived from the canonical application origin
- Google verified-email enforcement and stable `sub` identity mapping
- Facebook access-token debugging, app-ID validation, user-ID matching, and app-secret proof
- Provider account uniqueness and collision protection
- Automatic linking only when the provider supplies a verified email or the local email is already verified
- Safe authenticated provider linking and unlinking
- Prevention of removing the final available sign-in method
- Same-origin request validation for mutations
- Authentication audit events
- User suspension and role enforcement scaffolding
- Private no-store and no-index headers on administration and authentication routes

## Roles and owner bootstrap

Roles:

- `SUPER_ADMIN`
- `ADMIN`
- `MANAGER`
- `STAFF`
- `VIEWER`

The first approved active account receives `SUPER_ADMIN`. Later registrations receive `STAFF`.

Configure the owner allowlist before opening registration:

```env
ADMIN_BOOTSTRAP_EMAILS=owner@bjelectronics.shop
ALLOW_PUBLIC_SIGNUP=true
```

After the owner account is created and verified, disable public account creation:

```env
ALLOW_PUBLIC_SIGNUP=false
```

Existing password and linked-provider accounts can still sign in when public signup is disabled.

## Required runtime configuration

```env
NEXT_PUBLIC_APP_URL=https://bjelectronics.shop
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

Create a Google OAuth web application and configure this exact authorized redirect URI:

```text
https://bjelectronics.shop/api/auth/oauth/google/callback
```

Hostinger variables:

```env
GOOGLE_CLIENT_ID=<google-web-client-id>
GOOGLE_CLIENT_SECRET=<google-web-client-secret>
```

The application requests only `openid`, `email`, and `profile`. Google identities must return a verified email address.

## Facebook configuration

Configure Facebook Login for the Meta application and add this exact valid OAuth redirect URI:

```text
https://bjelectronics.shop/api/auth/oauth/facebook/callback
```

Hostinger variables:

```env
FACEBOOK_CLIENT_ID=<meta-app-id>
FACEBOOK_CLIENT_SECRET=<meta-app-secret>
FACEBOOK_GRAPH_API_VERSION=<version-configured-in-meta-app>
```

Facebook must grant `email` and `public_profile`. Accounts that do not return an email address cannot be provisioned automatically.

## Database initialization

Run migrations before enabling the release:

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

`auth_accounts` stores provider identity keys and profile metadata, never OAuth access tokens or client secrets.

## Production activation sequence

1. Configure PostgreSQL, `AUTH_SECRET`, and `ADMIN_BOOTSTRAP_EMAILS`.
2. Configure Google and/or Facebook credentials.
3. Register the exact production callback URLs with each provider.
4. Run `npm run db:migrate`.
5. Deploy the application.
6. Open `https://bjelectronics.shop/sign-up`.
7. Create or authorize the approved owner account.
8. Confirm `SUPER_ADMIN` access at `https://bjelectronics.shop/admin`.
9. Open `/admin/security` and connect a second sign-in method.
10. Set `ALLOW_PUBLIC_SIGNUP=false`.
11. Restart or redeploy the application.

## Scheduled security extensions

- Transactional email verification for local password accounts
- Password reset email delivery
- Multi-factor authentication and recovery codes
- Administrator invitation workflow
- Active-device and session management
- Fine-grained permission editor
- Security-event notifications
