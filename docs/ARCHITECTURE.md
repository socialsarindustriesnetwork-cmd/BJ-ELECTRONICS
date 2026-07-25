# BJ Electronics Platform Architecture

## Trust boundaries

The public store and administration application are separate deployable processes.

```text
Browser → www.bjelectronics.shop → apps/store
Administrator browser → admin.bjelectronics.shop → apps/admin
Both applications → shared PostgreSQL
```

The store has read-only catalog endpoints. Product mutations exist only in the admin application and require a valid administrator session plus an authorized role.

## Shared source of truth

PostgreSQL is the authoritative source for:

- Users, sessions, roles, and authentication providers
- Product catalog
- Publication state
- Inventory quantity
- Durable commerce events

No synchronization relies on in-memory process state.

## Mutation transaction

Admin product mutations perform these operations in one transaction:

1. Lock or insert the product row.
2. Validate optimistic version when updating.
3. Apply product and inventory state.
4. Insert a durable ordered `commerce_events` record.
5. Commit both changes atomically.

## Store synchronization

The storefront opens a same-origin Server-Sent Events connection to `/api/realtime`. The endpoint reads new events from PostgreSQL using the last event ID as its cursor. When a product or inventory event arrives, the client reloads the authoritative catalog endpoint.

This provides:

- Cross-process synchronization
- Restart tolerance
- Ordered event delivery
- Reconnection from the previous cursor
- No cross-domain browser credentials

## Security model

- Admin cookies are host-only on `admin.bjelectronics.shop`.
- Store pages do not receive administrator session cookies.
- Admin mutations require same-origin requests.
- Product writes require `SUPER_ADMIN`, `ADMIN`, or `MANAGER`.
- Product versions prevent silent concurrent overwrites.
- Admin responses are private, no-store, and noindex.
- Store and admin applications use independent CSP and health endpoints.
- OAuth callbacks terminate only on the admin origin.

## Deployment model

Two Hostinger Node.js Web Apps consume the same repository and `main` branch. Each app builds a separate Next.js workspace and uses the shared database. GitHub Actions validates both builds before production release automation runs.
