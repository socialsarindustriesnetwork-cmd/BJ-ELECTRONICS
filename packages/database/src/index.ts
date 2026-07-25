import { Pool, type PoolClient, type QueryResultRow } from "pg";
import type { CommerceEvent, CommerceEventType } from "@bje/realtime";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  priceCents: number;
  compareAtCents: number | null;
  currency: string;
  inventoryQuantity: number;
  status: ProductStatus;
  imageUrl: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  slug?: string;
  sku: string;
  description?: string;
  priceCents: number;
  compareAtCents?: number | null;
  currency?: string;
  inventoryQuantity?: number;
  status?: ProductStatus;
  imageUrl?: string | null;
};

type ProductRow = QueryResultRow & {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  currency: string;
  inventory_quantity: number;
  status: ProductStatus;
  image_url: string | null;
  version: number;
  created_at: Date;
  updated_at: Date;
};

type EventRow = QueryResultRow & {
  id: string | number;
  event_type: CommerceEventType;
  aggregate_type: "PRODUCT" | "INVENTORY" | "ORDER";
  aggregate_id: string;
  payload: Record<string, unknown>;
  created_at: Date;
};

declare global {
  var __bjeCommercePool: Pool | undefined;
}

function databaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) throw new Error("DATABASE_URL is not configured.");
  return value;
}

function createPool(): Pool {
  return new Pool({
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

export function getCommercePool(): Pool {
  if (!globalThis.__bjeCommercePool) globalThis.__bjeCommercePool = createPool();
  return globalThis.__bjeCommercePool;
}

export async function commerceQuery<T extends QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<T[]> {
  const result = await getCommercePool().query<T>(text, [...values]);
  return result.rows;
}

export async function commerceTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getCommercePool().connect();
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

function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description,
    priceCents: row.price_cents,
    compareAtCents: row.compare_at_cents,
    currency: row.currency,
    inventoryQuantity: row.inventory_quantity,
    status: row.status,
    imageUrl: row.image_url,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function eventFromRow(row: EventRow): CommerceEvent {
  return {
    id: Number(row.id),
    type: row.event_type,
    aggregate: row.aggregate_type,
    aggregateId: row.aggregate_id,
    payload: row.payload ?? {},
    createdAt: row.created_at.toISOString(),
  };
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function publishEvent(
  client: PoolClient,
  input: {
    type: CommerceEventType;
    aggregate: "PRODUCT" | "INVENTORY" | "ORDER";
    aggregateId: string;
    payload?: Record<string, unknown>;
    actorUserId?: string | null;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO commerce_events
      (event_type, aggregate_type, aggregate_id, actor_user_id, payload)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [
      input.type,
      input.aggregate,
      input.aggregateId,
      input.actorUserId ?? null,
      JSON.stringify(input.payload ?? {}),
    ],
  );
}

const productSelect = `
  SELECT id, name, slug, sku, description, price_cents, compare_at_cents,
         currency, inventory_quantity, status, image_url, version,
         created_at, updated_at
  FROM commerce_products`;

export async function listPublishedProducts(input?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const search = input?.search?.trim() ?? "";
  const limit = Math.min(Math.max(input?.limit ?? 24, 1), 100);
  const offset = Math.max(input?.offset ?? 0, 0);
  const rows = await commerceQuery<ProductRow>(
    `${productSelect}
     WHERE status = 'ACTIVE'
       AND ($1 = '' OR name ILIKE '%' || $1 || '%' OR sku ILIKE '%' || $1 || '%')
     ORDER BY updated_at DESC
     LIMIT $2 OFFSET $3`,
    [search, limit, offset],
  );
  return rows.map(productFromRow);
}

export async function listAdminProducts(input?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const search = input?.search?.trim() ?? "";
  const limit = Math.min(Math.max(input?.limit ?? 100, 1), 200);
  const offset = Math.max(input?.offset ?? 0, 0);
  const rows = await commerceQuery<ProductRow>(
    `${productSelect}
     WHERE ($1 = '' OR name ILIKE '%' || $1 || '%' OR sku ILIKE '%' || $1 || '%')
     ORDER BY updated_at DESC
     LIMIT $2 OFFSET $3`,
    [search, limit, offset],
  );
  return rows.map(productFromRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await commerceQuery<ProductRow>(
    `${productSelect} WHERE slug = $1 AND status = 'ACTIVE' LIMIT 1`,
    [slug],
  );
  return rows[0] ? productFromRow(rows[0]) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const rows = await commerceQuery<ProductRow>(
    `${productSelect} WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ? productFromRow(rows[0]) : null;
}

export async function createProduct(
  input: ProductInput,
  actorUserId?: string | null,
): Promise<Product> {
  return commerceTransaction(async (client) => {
    const result = await client.query<ProductRow>(
      `INSERT INTO commerce_products
        (name, slug, sku, description, price_cents, compare_at_cents, currency,
         inventory_quantity, status, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, slug, sku, description, price_cents, compare_at_cents,
                 currency, inventory_quantity, status, image_url, version,
                 created_at, updated_at`,
      [
        input.name.trim(),
        slugify(input.slug || input.name),
        input.sku.trim().toUpperCase(),
        input.description?.trim() ?? "",
        input.priceCents,
        input.compareAtCents ?? null,
        input.currency ?? "USD",
        input.inventoryQuantity ?? 0,
        input.status ?? "DRAFT",
        input.imageUrl?.trim() || null,
      ],
    );
    const product = productFromRow(result.rows[0]);
    await publishEvent(client, {
      type: "PRODUCT.CREATED",
      aggregate: "PRODUCT",
      aggregateId: product.id,
      actorUserId,
      payload: { slug: product.slug, status: product.status },
    });
    return product;
  });
}

export async function updateProduct(
  id: string,
  input: ProductInput & { expectedVersion?: number },
  actorUserId?: string | null,
): Promise<Product> {
  return commerceTransaction(async (client) => {
    const locked = await client.query<ProductRow>(
      `${productSelect} WHERE id = $1 LIMIT 1 FOR UPDATE`,
      [id],
    );
    const current = locked.rows[0];
    if (!current) {
      const error = new Error("Product not found.");
      error.name = "ProductNotFoundError";
      throw error;
    }
    if (input.expectedVersion !== undefined && input.expectedVersion !== current.version) {
      const error = new Error("This product changed in another session. Refresh and try again.");
      error.name = "ProductVersionConflictError";
      throw error;
    }

    const result = await client.query<ProductRow>(
      `UPDATE commerce_products
       SET name = $2,
           slug = $3,
           sku = $4,
           description = $5,
           price_cents = $6,
           compare_at_cents = $7,
           currency = $8,
           inventory_quantity = $9,
           status = $10,
           image_url = $11,
           version = version + 1,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, slug, sku, description, price_cents, compare_at_cents,
                 currency, inventory_quantity, status, image_url, version,
                 created_at, updated_at`,
      [
        id,
        input.name.trim(),
        slugify(input.slug || input.name),
        input.sku.trim().toUpperCase(),
        input.description?.trim() ?? "",
        input.priceCents,
        input.compareAtCents ?? null,
        input.currency ?? "USD",
        input.inventoryQuantity ?? 0,
        input.status ?? "DRAFT",
        input.imageUrl?.trim() || null,
      ],
    );
    const product = productFromRow(result.rows[0]);
    const inventoryChanged = current.inventory_quantity !== product.inventoryQuantity;
    await publishEvent(client, {
      type: inventoryChanged ? "INVENTORY.UPDATED" : "PRODUCT.UPDATED",
      aggregate: inventoryChanged ? "INVENTORY" : "PRODUCT",
      aggregateId: product.id,
      actorUserId,
      payload: {
        slug: product.slug,
        status: product.status,
        inventoryQuantity: product.inventoryQuantity,
        version: product.version,
      },
    });
    return product;
  });
}

export async function archiveProduct(id: string, actorUserId?: string | null): Promise<void> {
  await commerceTransaction(async (client) => {
    const result = await client.query<{ id: string; slug: string }>(
      `UPDATE commerce_products
       SET status = 'ARCHIVED', version = version + 1, updated_at = NOW()
       WHERE id = $1
       RETURNING id, slug`,
      [id],
    );
    if (!result.rows[0]) {
      const error = new Error("Product not found.");
      error.name = "ProductNotFoundError";
      throw error;
    }
    await publishEvent(client, {
      type: "PRODUCT.ARCHIVED",
      aggregate: "PRODUCT",
      aggregateId: id,
      actorUserId,
      payload: { slug: result.rows[0].slug },
    });
  });
}

export async function getDashboardSummary(): Promise<{
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  inventoryUnits: number;
  latestEventId: number;
}> {
  const rows = await commerceQuery<{
    total_products: string;
    active_products: string;
    low_stock_products: string;
    inventory_units: string;
    latest_event_id: string;
  }>(
    `SELECT
       COUNT(*)::text AS total_products,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::text AS active_products,
       COUNT(*) FILTER (WHERE status = 'ACTIVE' AND inventory_quantity <= 5)::text AS low_stock_products,
       COALESCE(SUM(inventory_quantity), 0)::text AS inventory_units,
       COALESCE((SELECT MAX(id) FROM commerce_events), 0)::text AS latest_event_id
     FROM commerce_products`,
  );
  const row = rows[0];
  return {
    totalProducts: Number(row?.total_products ?? 0),
    activeProducts: Number(row?.active_products ?? 0),
    lowStockProducts: Number(row?.low_stock_products ?? 0),
    inventoryUnits: Number(row?.inventory_units ?? 0),
    latestEventId: Number(row?.latest_event_id ?? 0),
  };
}

export async function getCommerceEvents(afterId: number, limit = 100): Promise<CommerceEvent[]> {
  const rows = await commerceQuery<EventRow>(
    `SELECT id, event_type, aggregate_type, aggregate_id, payload, created_at
     FROM commerce_events
     WHERE id > $1
     ORDER BY id ASC
     LIMIT $2`,
    [Math.max(afterId, 0), Math.min(Math.max(limit, 1), 250)],
  );
  return rows.map(eventFromRow);
}

export async function checkCommerceDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const started = Date.now();
  try {
    await getCommercePool().query("SELECT 1");
    return { ok: true, latencyMs: Date.now() - started };
  } catch {
    return { ok: false, latencyMs: Date.now() - started };
  }
}
