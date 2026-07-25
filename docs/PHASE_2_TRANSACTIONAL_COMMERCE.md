# Phase 2 — Transactional Commerce Foundation

## Implemented scope

The public store now supports a PostgreSQL-backed guest cart and checkout flow. The administration application now includes protected order and fulfilment operations.

```text
Store cart:       https://www.bjelectronics.shop/cart
Store checkout:   https://www.bjelectronics.shop/checkout
Admin orders:     https://admin.bjelectronics.shop/orders
```

## Trust boundaries

- Cart credentials are opaque 256-bit values stored in an HTTP-only, secure, host-only store cookie.
- PostgreSQL stores only SHA-256 cart-token hashes.
- Private order links use a separate 256-bit access token; PostgreSQL stores only its SHA-256 hash.
- Storefront writes require an exact same-origin request and `application/json`.
- Administrator order mutations require an authenticated `SUPER_ADMIN`, `ADMIN`, or `MANAGER` role.
- The public store never receives administrator cookies.

## Checkout transaction

Order creation is one PostgreSQL transaction:

1. Lock the active cart.
2. Lock every selected product row in deterministic order.
3. Revalidate publication status, currency, price, requested quantity, and current inventory.
4. Calculate subtotal, shipping, and total from authoritative database values.
5. Create the order and immutable line-item snapshots.
6. Deduct available inventory.
7. Create inventory reservation records.
8. Convert the cart.
9. Publish the durable `ORDER.CREATED` event.
10. Commit all changes together.

Any failure rolls back the complete operation.

## Order workflow

```text
PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
    |          |             |
    +----------+-------------+-> CANCELLED
```

Rules:

- Invalid transitions return HTTP 409.
- Confirmation marks active reservations as committed.
- Cancellation before shipment releases reserved quantities back to product inventory.
- Delivered and cancelled orders are terminal.
- Every successful transition publishes `ORDER.UPDATED`.

## Payment methods in this release

- Cash on delivery
- Bank transfer

External card, mobile-wallet, and payment-gateway processing are not included in this release. Those providers require signed webhook handling, idempotency, reconciliation, and refund modules.

## Database migration

Run before either application starts:

```bash
npm run db:validate
npm run db:migrate
```

Migration `004_transactional_commerce.sql` adds:

- `commerce_carts`
- `commerce_cart_items`
- `commerce_orders`
- `commerce_order_items`
- `commerce_inventory_reservations`

The Phase 1 migration runner serializes concurrent deployments and verifies immutable migration checksums.

## Production validation

After deployment, the production checker validates:

- Store and admin liveness/readiness
- Store, cart, and checkout routes
- Server cart API payload
- Secure cart-cookie attributes
- Public catalog availability
- Store-to-admin route isolation
- Protected products and orders routes
- Admin authentication and security headers
- Canonical apex redirect
- Optional release-SHA match

## Remaining transactional modules

- Customer accounts and saved addresses
- Online payment gateways
- Payment webhooks and reconciliation
- Order-detail administration
- Shipment and tracking providers
- Returns, exchanges, refunds, and warranty claims
- Reservation expiry worker
- Transactional email and SMS notifications
- Taxes, coupons, promotions, and gift cards
