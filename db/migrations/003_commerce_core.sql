CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS commerce_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  sku VARCHAR(80) NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  compare_at_cents INTEGER CHECK (compare_at_cents IS NULL OR compare_at_cents >= price_cents),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  inventory_quantity INTEGER NOT NULL DEFAULT 0 CHECK (inventory_quantity >= 0),
  status VARCHAR(16) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
  image_url TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS commerce_products_status_updated_idx
  ON commerce_products(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS commerce_products_inventory_idx
  ON commerce_products(inventory_quantity)
  WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS commerce_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(40) NOT NULL CHECK (event_type IN (
    'PRODUCT.CREATED', 'PRODUCT.UPDATED', 'PRODUCT.ARCHIVED',
    'INVENTORY.UPDATED', 'ORDER.CREATED', 'ORDER.UPDATED'
  )),
  aggregate_type VARCHAR(20) NOT NULL CHECK (aggregate_type IN ('PRODUCT', 'INVENTORY', 'ORDER')),
  aggregate_id UUID NOT NULL,
  actor_user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS commerce_events_stream_idx ON commerce_events(id ASC);
CREATE INDEX IF NOT EXISTS commerce_events_aggregate_idx
  ON commerce_events(aggregate_type, aggregate_id, id DESC);

INSERT INTO commerce_products
  (id, name, slug, sku, description, price_cents, compare_at_cents, currency,
   inventory_quantity, status, image_url)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'NovaBook Pro 14', 'novabook-pro-14', 'NBP14-512-SL',
   'A lightweight performance laptop with a vivid 14-inch display and all-day battery.', 124900, 139900, 'USD', 8, 'ACTIVE', NULL),
  ('10000000-0000-4000-8000-000000000002', 'Pulse ANC Headphones', 'pulse-anc-headphones', 'PAH-02-BK',
   'Wireless over-ear headphones with adaptive noise cancellation and clear voice calls.', 24900, 29900, 'USD', 16, 'ACTIVE', NULL),
  ('10000000-0000-4000-8000-000000000003', 'Arc 65W GaN Charger', 'arc-65w-gan-charger', 'ARC65-WH',
   'Compact dual-port fast charger for laptops, tablets, and phones.', 6900, 7900, 'USD', 34, 'ACTIVE', NULL),
  ('10000000-0000-4000-8000-000000000004', 'Vision 4K Smart Display', 'vision-4k-smart-display', 'V4K-55-BK',
   'A cinematic 55-inch 4K smart display with HDR and modern streaming controls.', 79900, 89900, 'USD', 5, 'ACTIVE', NULL),
  ('10000000-0000-4000-8000-000000000005', 'Orbit Smart Camera', 'orbit-smart-camera', 'OSC-2K-WH',
   'Indoor 2K security camera with motion alerts, privacy mode, and night vision.', 9900, NULL, 'USD', 21, 'ACTIVE', NULL),
  ('10000000-0000-4000-8000-000000000006', 'Flow Mechanical Keyboard', 'flow-mechanical-keyboard', 'FMK-75-GR',
   'Compact wireless mechanical keyboard with hot-swappable switches and multi-device pairing.', 13900, 15900, 'USD', 12, 'ACTIVE', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO commerce_events (event_type, aggregate_type, aggregate_id, payload)
SELECT 'PRODUCT.CREATED', 'PRODUCT', id, jsonb_build_object('slug', slug, 'status', status, 'seeded', true)
FROM commerce_products p
WHERE p.id::text LIKE '10000000-0000-4000-8000-%'
  AND NOT EXISTS (
    SELECT 1 FROM commerce_events e
    WHERE e.aggregate_id = p.id AND e.payload ->> 'seeded' = 'true'
  );
