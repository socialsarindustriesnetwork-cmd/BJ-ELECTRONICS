import { Pool, type PoolClient, type QueryResultRow } from "pg";

export type CartLine = {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  inventoryQuantity: number;
  imageUrl: string | null;
};

export type CommerceCart = {
  id: string;
  currency: string;
  itemCount: number;
  subtotalCents: number;
  estimatedShippingCents: number;
  estimatedTotalCents: number;
  expiresAt: string;
  lines: CartLine[];
};

export type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  region?: string | null;
  postalCode?: string | null;
  country?: string;
  customerNote?: string | null;
  paymentMethod: "CASH_ON_DELIVERY" | "BANK_TRANSFER";
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";

export type OrderLine = {
  id: string;
  productId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type CommerceOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: CheckoutInput["paymentMethod"];
  paymentStatus: PaymentStatus;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  region: string | null;
  postalCode: string | null;
  country: string;
  customerNote: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  lines?: OrderLine[];
};

type CartRow = QueryResultRow & {
  id: string;
  currency: string;
  expires_at: Date;
  status: "ACTIVE" | "CONVERTED" | "ABANDONED";
};

type CartLineRow = QueryResultRow & {
  product_id: string;
  name: string;
  slug: string;
  sku: string;
  quantity: number;
  price_cents: number;
  inventory_quantity: number;
  image_url: string | null;
};

type CheckoutLineRow = QueryResultRow & CartLineRow & {
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  currency: string;
};

type OrderRow = QueryResultRow & {
  id: string;
  order_number: string | number;
  status: OrderStatus;
  payment_method: CheckoutInput["paymentMethod"];
  payment_status: PaymentStatus;
  currency: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_region: string | null;
  shipping_postal_code: string | null;
  shipping_country: string;
  customer_note: string | null;
  item_count: string | number;
  created_at: Date;
  updated_at: Date;
};

type OrderLineRow = QueryResultRow & {
  id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
};

declare global {
  var __bjeCommercePool: Pool | undefined;
}

function databaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) throw new Error("DATABASE_URL is not configured.");
  return value;
}

function getPool(): Pool {
  if (!globalThis.__bjeCommercePool) {
    globalThis.__bjeCommercePool = new Pool({
      connectionString: databaseUrl(),
      max: Number(process.env.DB_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
      ssl:
        process.env.DB_SSL === "false"
          ? false
          : process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
            : undefined,
    });
  }
  return globalThis.__bjeCommercePool;
}

async function transaction<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function applicationError(name: string, message: string): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

function orderNumber(value: string | number): string {
  return `BJ-${String(value).padStart(8, "0")}`;
}

function parseOrderNumber(value: string): number | null {
  const normalized = value.trim().toUpperCase().replace(/^BJ-/, "");
  if (!/^\d{1,18}$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function shippingFor(subtotalCents: number): number {
  return subtotalCents >= 10000 ? 0 : 999;
}

function cartLine(row: CartLineRow): CartLine {
  return {
    productId: row.product_id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    quantity: row.quantity,
    unitPriceCents: row.price_cents,
    lineTotalCents: row.price_cents * row.quantity,
    inventoryQuantity: row.inventory_quantity,
    imageUrl: row.image_url,
  };
}

function orderFromRow(row: OrderRow): CommerceOrder {
  return {
    id: row.id,
    orderNumber: orderNumber(row.order_number),
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    currency: row.currency,
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    addressLine1: row.shipping_address_line1,
    addressLine2: row.shipping_address_line2,
    city: row.shipping_city,
    region: row.shipping_region,
    postalCode: row.shipping_postal_code,
    country: row.shipping_country,
    customerNote: row.customer_note,
    itemCount: Number(row.item_count ?? 0),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function ensureActiveCart(client: PoolClient, tokenHash: string, lock = false): Promise<CartRow> {
  await client.query(
    `INSERT INTO commerce_carts (token_hash)
     VALUES ($1)
     ON CONFLICT (token_hash) DO NOTHING`,
    [tokenHash],
  );
  const result = await client.query<CartRow>(
    `SELECT id, currency, expires_at, status
     FROM commerce_carts
     WHERE token_hash = $1
     LIMIT 1${lock ? " FOR UPDATE" : ""}`,
    [tokenHash],
  );
  const cart = result.rows[0];
  if (!cart || cart.status !== "ACTIVE") {
    throw applicationError("CartUnavailableError", "This cart is no longer active.");
  }
  if (cart.expires_at.getTime() <= Date.now()) {
    await client.query("UPDATE commerce_carts SET status = 'ABANDONED', updated_at = NOW() WHERE id = $1", [cart.id]);
    throw applicationError("CartExpiredError", "This cart has expired.");
  }
  return cart;
}

export async function getCart(tokenHash: string): Promise<CommerceCart> {
  return transaction(async (client) => {
    const cart = await ensureActiveCart(client, tokenHash);
    const result = await client.query<CartLineRow>(
      `SELECT p.id AS product_id, p.name, p.slug, p.sku, i.quantity,
              p.price_cents, p.inventory_quantity, p.image_url
       FROM commerce_cart_items i
       JOIN commerce_products p ON p.id = i.product_id
       WHERE i.cart_id = $1
       ORDER BY i.created_at ASC`,
      [cart.id],
    );
    const lines = result.rows.map(cartLine);
    const subtotalCents = lines.reduce((total, line) => total + line.lineTotalCents, 0);
    const estimatedShippingCents = lines.length ? shippingFor(subtotalCents) : 0;
    return {
      id: cart.id,
      currency: cart.currency,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      subtotalCents,
      estimatedShippingCents,
      estimatedTotalCents: subtotalCents + estimatedShippingCents,
      expiresAt: cart.expires_at.toISOString(),
      lines,
    };
  });
}

export async function setCartItem(tokenHash: string, productId: string, quantity: number): Promise<CommerceCart> {
  const normalizedQuantity = Math.trunc(quantity);
  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 0 || normalizedQuantity > 20) {
    throw applicationError("CartValidationError", "Quantity must be between 0 and 20.");
  }

  await transaction(async (client) => {
    const cart = await ensureActiveCart(client, tokenHash, true);
    if (normalizedQuantity === 0) {
      await client.query("DELETE FROM commerce_cart_items WHERE cart_id = $1 AND product_id = $2", [cart.id, productId]);
      await client.query("UPDATE commerce_carts SET updated_at = NOW() WHERE id = $1", [cart.id]);
      return;
    }

    const productResult = await client.query<{
      id: string;
      status: string;
      inventory_quantity: number;
      currency: string;
    }>(
      `SELECT id, status, inventory_quantity, currency
       FROM commerce_products
       WHERE id = $1
       LIMIT 1`,
      [productId],
    );
    const product = productResult.rows[0];
    if (!product || product.status !== "ACTIVE") {
      throw applicationError("ProductUnavailableError", "This product is not available.");
    }
    if (normalizedQuantity > product.inventory_quantity) {
      throw applicationError("InventoryUnavailableError", `Only ${product.inventory_quantity} units are currently available.`);
    }
    if (cart.currency !== product.currency) {
      throw applicationError("CartCurrencyError", "Products with different currencies cannot share one cart.");
    }

    await client.query(
      `INSERT INTO commerce_cart_items (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()`,
      [cart.id, productId, normalizedQuantity],
    );
    await client.query("UPDATE commerce_carts SET updated_at = NOW() WHERE id = $1", [cart.id]);
  });

  return getCart(tokenHash);
}

export async function createCheckoutOrder(
  tokenHash: string,
  accessTokenHash: string,
  input: CheckoutInput,
): Promise<CommerceOrder> {
  return transaction(async (client) => {
    const cart = await ensureActiveCart(client, tokenHash, true);
    const items = await client.query<CheckoutLineRow>(
      `SELECT p.id AS product_id, p.name, p.slug, p.sku, i.quantity,
              p.price_cents, p.inventory_quantity, p.image_url, p.status, p.currency
       FROM commerce_cart_items i
       JOIN commerce_products p ON p.id = i.product_id
       WHERE i.cart_id = $1
       ORDER BY p.id ASC
       FOR UPDATE OF p`,
      [cart.id],
    );
    if (!items.rowCount) throw applicationError("EmptyCartError", "Add at least one product before checkout.");

    for (const item of items.rows) {
      if (item.status !== "ACTIVE") {
        throw applicationError("ProductUnavailableError", `${item.name} is no longer available.`);
      }
      if (item.quantity > item.inventory_quantity) {
        throw applicationError(
          "InventoryUnavailableError",
          `${item.name} has only ${item.inventory_quantity} units available.`,
        );
      }
      if (item.currency !== cart.currency) {
        throw applicationError("CartCurrencyError", "The cart contains inconsistent currencies.");
      }
    }

    const subtotalCents = items.rows.reduce((total, item) => total + item.price_cents * item.quantity, 0);
    const shippingCents = shippingFor(subtotalCents);
    const orderResult = await client.query<OrderRow>(
      `INSERT INTO commerce_orders (
         access_token_hash, payment_method, currency, subtotal_cents, shipping_cents, total_cents,
         customer_name, customer_email, customer_phone, shipping_address_line1,
         shipping_address_line2, shipping_city, shipping_region, shipping_postal_code,
         shipping_country, customer_note
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, LOWER($8), $9, $10, $11, $12, $13, $14, $15, $16
       )
       RETURNING *, 0::int AS item_count`,
      [
        accessTokenHash,
        input.paymentMethod,
        cart.currency,
        subtotalCents,
        shippingCents,
        subtotalCents + shippingCents,
        input.customerName.trim(),
        input.customerEmail.trim(),
        input.customerPhone.trim(),
        input.addressLine1.trim(),
        input.addressLine2?.trim() || null,
        input.city.trim(),
        input.region?.trim() || null,
        input.postalCode?.trim() || null,
        (input.country || "BD").trim().toUpperCase(),
        input.customerNote?.trim() || null,
      ],
    );
    const order = orderResult.rows[0];

    for (const item of items.rows) {
      const lineTotal = item.price_cents * item.quantity;
      await client.query(
        `INSERT INTO commerce_order_items
          (order_id, product_id, product_name, sku, quantity, unit_price_cents, line_total_cents)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.product_id, item.name, item.sku, item.quantity, item.price_cents, lineTotal],
      );
      const inventory = await client.query(
        `UPDATE commerce_products
         SET inventory_quantity = inventory_quantity - $2,
             version = version + 1,
             updated_at = NOW()
         WHERE id = $1 AND inventory_quantity >= $2`,
        [item.product_id, item.quantity],
      );
      if (!inventory.rowCount) {
        throw applicationError("InventoryUnavailableError", `${item.name} inventory changed during checkout.`);
      }
      await client.query(
        `INSERT INTO commerce_inventory_reservations (order_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [order.id, item.product_id, item.quantity],
      );
    }

    await client.query(
      `UPDATE commerce_carts
       SET status = 'CONVERTED', updated_at = NOW()
       WHERE id = $1`,
      [cart.id],
    );
    await client.query(
      `INSERT INTO commerce_events (event_type, aggregate_type, aggregate_id, payload)
       VALUES ('ORDER.CREATED', 'ORDER', $1, $2::jsonb)`,
      [
        order.id,
        JSON.stringify({
          orderNumber: orderNumber(order.order_number),
          status: order.status,
          itemCount: items.rows.reduce((total, item) => total + item.quantity, 0),
          totalCents: order.total_cents,
        }),
      ],
    );

    return {
      ...orderFromRow({
        ...order,
        item_count: items.rows.reduce((total, item) => total + item.quantity, 0),
      }),
      lines: items.rows.map((item, index) => ({
        id: `${order.id}-${index}`,
        productId: item.product_id,
        productName: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPriceCents: item.price_cents,
        lineTotalCents: item.price_cents * item.quantity,
      })),
    };
  });
}

const orderSelect = `
  SELECT o.*,
         COALESCE(SUM(oi.quantity), 0)::int AS item_count
  FROM commerce_orders o
  LEFT JOIN commerce_order_items oi ON oi.order_id = o.id`;

export async function getOrderByAccess(orderNumberValue: string, accessTokenHash: string): Promise<CommerceOrder | null> {
  const numericOrderNumber = parseOrderNumber(orderNumberValue);
  if (!numericOrderNumber) return null;
  const result = await getPool().query<OrderRow>(
    `${orderSelect}
     WHERE o.order_number = $1 AND o.access_token_hash = $2
     GROUP BY o.id
     LIMIT 1`,
    [numericOrderNumber, accessTokenHash],
  );
  const row = result.rows[0];
  if (!row) return null;
  const lines = await getPool().query<OrderLineRow>(
    `SELECT id, product_id, product_name, sku, quantity, unit_price_cents, line_total_cents
     FROM commerce_order_items
     WHERE order_id = $1
     ORDER BY created_at ASC`,
    [row.id],
  );
  return {
    ...orderFromRow(row),
    lines: lines.rows.map((line) => ({
      id: line.id,
      productId: line.product_id,
      productName: line.product_name,
      sku: line.sku,
      quantity: line.quantity,
      unitPriceCents: line.unit_price_cents,
      lineTotalCents: line.line_total_cents,
    })),
  };
}

export async function listOrders(input?: { limit?: number; status?: OrderStatus }): Promise<CommerceOrder[]> {
  const limit = Math.min(Math.max(input?.limit ?? 100, 1), 250);
  const result = await getPool().query<OrderRow>(
    `${orderSelect}
     WHERE ($1::text IS NULL OR o.status = $1)
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT $2`,
    [input?.status ?? null, limit],
  );
  return result.rows.map(orderFromRow);
}

export async function getOrderSummary(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  grossOrderValueCents: number;
}> {
  const result = await getPool().query<{
    total_orders: string;
    pending_orders: string;
    processing_orders: string;
    gross_value: string;
  }>(
    `SELECT
       COUNT(*)::text AS total_orders,
       COUNT(*) FILTER (WHERE status IN ('PENDING', 'CONFIRMED'))::text AS pending_orders,
       COUNT(*) FILTER (WHERE status IN ('PROCESSING', 'SHIPPED'))::text AS processing_orders,
       COALESCE(SUM(total_cents) FILTER (WHERE status <> 'CANCELLED'), 0)::text AS gross_value
     FROM commerce_orders`,
  );
  const row = result.rows[0];
  return {
    totalOrders: Number(row?.total_orders ?? 0),
    pendingOrders: Number(row?.pending_orders ?? 0),
    processingOrders: Number(row?.processing_orders ?? 0),
    grossOrderValueCents: Number(row?.gross_value ?? 0),
  };
}

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  actorUserId?: string | null,
): Promise<CommerceOrder> {
  return transaction(async (client) => {
    const currentResult = await client.query<OrderRow>(
      `SELECT o.*, COALESCE((SELECT SUM(quantity) FROM commerce_order_items WHERE order_id = o.id), 0)::int AS item_count
       FROM commerce_orders o
       WHERE o.id = $1
       LIMIT 1
       FOR UPDATE`,
      [orderId],
    );
    const current = currentResult.rows[0];
    if (!current) throw applicationError("OrderNotFoundError", "Order not found.");
    if (!transitions[current.status].includes(nextStatus)) {
      throw applicationError(
        "OrderTransitionError",
        `Order cannot move from ${current.status} to ${nextStatus}.`,
      );
    }

    if (nextStatus === "CANCELLED") {
      const reservations = await client.query<{ product_id: string; quantity: number }>(
        `SELECT product_id, quantity
         FROM commerce_inventory_reservations
         WHERE order_id = $1 AND status IN ('ACTIVE', 'COMMITTED')
         FOR UPDATE`,
        [orderId],
      );
      for (const reservation of reservations.rows) {
        await client.query(
          `UPDATE commerce_products
           SET inventory_quantity = inventory_quantity + $2,
               version = version + 1,
               updated_at = NOW()
           WHERE id = $1`,
          [reservation.product_id, reservation.quantity],
        );
      }
      await client.query(
        `UPDATE commerce_inventory_reservations
         SET status = 'RELEASED', updated_at = NOW()
         WHERE order_id = $1 AND status IN ('ACTIVE', 'COMMITTED')`,
        [orderId],
      );
    } else if (nextStatus === "CONFIRMED") {
      await client.query(
        `UPDATE commerce_inventory_reservations
         SET status = 'COMMITTED', updated_at = NOW()
         WHERE order_id = $1 AND status = 'ACTIVE'`,
        [orderId],
      );
    }

    const updatedResult = await client.query<OrderRow>(
      `UPDATE commerce_orders
       SET status = $2,
           payment_status = CASE
             WHEN $2 = 'CONFIRMED' AND payment_method = 'BANK_TRANSFER' THEN 'AUTHORIZED'
             WHEN $2 = 'DELIVERED' AND payment_method = 'CASH_ON_DELIVERY' THEN 'PAID'
             ELSE payment_status
           END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *, $3::int AS item_count`,
      [orderId, nextStatus, current.item_count],
    );
    const updated = updatedResult.rows[0];
    await client.query(
      `INSERT INTO commerce_events
        (event_type, aggregate_type, aggregate_id, actor_user_id, payload)
       VALUES ('ORDER.UPDATED', 'ORDER', $1, $2, $3::jsonb)`,
      [
        orderId,
        actorUserId ?? null,
        JSON.stringify({ orderNumber: orderNumber(updated.order_number), previousStatus: current.status, status: nextStatus }),
      ],
    );
    return orderFromRow(updated);
  });
}
