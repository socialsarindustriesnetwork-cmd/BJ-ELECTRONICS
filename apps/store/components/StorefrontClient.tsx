"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@bje/database";
import type { CommerceCart } from "@bje/database/transactions";
import { BrandLogo } from "@bje/ui";

function money(product: Product): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.priceCents / 100);
}

function productInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function StorefrontClient({
  initialProducts,
  latestEventId,
  adminUrl,
}: {
  initialProducts: Product[];
  latestEventId: number;
  adminUrl: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [cartMessage, setCartMessage] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const cursor = useRef(latestEventId);

  useEffect(() => {
    void fetch("/api/cart", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { cart?: CommerceCart }) => {
        if (payload.cart) setCart(payload.cart);
      })
      .catch(() => undefined);

    const cartListener = (event: Event) => {
      const count = (event as CustomEvent<number>).detail;
      setCart((current) => current ? { ...current, itemCount: count } : current);
    };
    window.addEventListener("bje:cart", cartListener);

    const source = new EventSource(`/api/realtime?after=${cursor.current}`);
    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false);
    source.addEventListener("commerce", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent<string>).data) as { id?: number };
        if (typeof payload.id === "number") cursor.current = payload.id;
      } catch {
        // The catalog refresh below is authoritative even when an event payload is malformed.
      }
      void fetch("/api/catalog", { cache: "no-store" })
        .then((response) => response.json())
        .then((payload: { products?: Product[]; latestEventId?: number }) => {
          if (payload.products) setProducts(payload.products);
          if (typeof payload.latestEventId === "number") cursor.current = payload.latestEventId;
        })
        .catch(() => undefined);
    });
    return () => {
      window.removeEventListener("bje:cart", cartListener);
      source.close();
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      `${product.name} ${product.sku} ${product.description}`.toLowerCase().includes(normalized),
    );
  }, [products, query]);

  async function addToCart(product: Product) {
    setAdding(product.id);
    setCartMessage("");
    try {
      const currentQuantity = cart?.lines.find((line) => line.productId === product.id)?.quantity ?? 0;
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: currentQuantity + 1 }),
      });
      const payload = await response.json() as { cart?: CommerceCart; error?: string };
      if (!response.ok || !payload.cart) throw new Error(payload.error || "Could not add this product.");
      setCart(payload.cart);
      setCartMessage(`${product.name} added to cart.`);
    } catch (error) {
      setCartMessage(error instanceof Error ? error.message : "Could not add this product.");
    } finally {
      setAdding(null);
    }
  }

  const cartCount = cart?.itemCount ?? 0;

  return (
    <div className="store-shell">
      <header className="store-header">
        <div className="header-inner">
          <Link className="brand-link" href="/" aria-label="BJ Electronics home">
            <BrandLogo />
          </Link>
          <nav className="store-nav" aria-label="Store navigation">
            <a href="#catalog">Products</a>
            <a href="#services">Why BJ Electronics</a>
            <a href="mailto:support@bjelectronics.shop">Support</a>
          </nav>
          <div className="header-actions">
            <a className="icon-action" href={adminUrl} aria-label="Administration portal">↗</a>
            <Link className="cart-button" href="/cart" aria-label={`${cartCount} items in cart`}>
              Cart <span className="cart-count">{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Official BJ Electronics online store</p>
            <h1>Technology that works <span>beautifully.</span></h1>
            <p>
              Discover dependable computing, audio, mobile, and smart-home products in a secure,
              responsive shopping experience connected directly to live store inventory.
            </p>
            <div className="hero-actions">
              <a className="primary-link" href="#catalog">Shop the collection</a>
              <a className="secondary-link" href="mailto:support@bjelectronics.shop">Talk to support</a>
            </div>
            <div className="trust-row">
              <span>Secure shopping</span>
              <span>Live inventory</span>
              <span>Transactional checkout</span>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orb" />
            <div className="hero-device">
              <small>Connected commerce platform</small>
              <strong>Store and operations, synchronized.</strong>
              <p>Catalog, inventory, carts, and orders are coordinated through one transactional data layer.</p>
              <div className="device-stats">
                <span>Fast catalog</span><span>Secure checkout</span><span>Live updates</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="catalog">
          <div className="section-heading">
            <div><p className="eyebrow">Featured catalog</p><h2>Products ready for everyday performance.</h2></div>
            <p>Availability, pricing, and publication status are controlled from the secure administration application.</p>
          </div>
          <div className="catalog-toolbar">
            <input
              className="search-box"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, SKUs, and categories"
              aria-label="Search catalog"
            />
            <span className="live-state">{live ? "Live catalog connected" : "Reconnecting live catalog"}</span>
          </div>
          {cartMessage ? <div className="store-notice" role="status">{cartMessage}</div> : null}

          {filtered.length ? (
            <div className="product-grid">
              {filtered.map((product) => (
                <article className="product-card" key={product.id}>
                  <Link className="product-visual" href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
                    <span className="product-mark">{productInitials(product.name)}</span>
                  </Link>
                  <div className="product-copy">
                    <div className="product-meta">
                      <span>{product.sku}</span>
                      <span className={product.inventoryQuantity <= 5 ? "stock-low" : "stock-ok"}>
                        {product.inventoryQuantity > 0 ? `${product.inventoryQuantity} available` : "Out of stock"}
                      </span>
                    </div>
                    <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
                    <p>{product.description}</p>
                    <div className="product-footer">
                      <span className="price">
                        <strong>{money(product)}</strong>
                        {product.compareAtCents && <del>{new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency }).format(product.compareAtCents / 100)}</del>}
                      </span>
                      <button
                        className="add-button"
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={product.inventoryQuantity < 1 || adding === product.id}
                      >
                        {product.inventoryQuantity < 1 ? "Unavailable" : adding === product.id ? "Adding…" : "Add to cart"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">No products match this search.</div>
          )}
        </section>

        <section className="section" id="services">
          <div className="section-heading">
            <div><p className="eyebrow">Built for confidence</p><h2>A professional shopping foundation.</h2></div>
          </div>
          <div className="service-grid">
            <article className="service-card"><span className="service-icon">✓</span><h3>Trusted catalog</h3><p>Published products come from one controlled operational source of truth.</p></article>
            <article className="service-card"><span className="service-icon">↻</span><h3>Realtime accuracy</h3><p>Product and inventory changes appear without requiring a full deployment.</p></article>
            <article className="service-card"><span className="service-icon">▣</span><h3>Protected checkout</h3><p>Inventory is locked and revalidated when an order is created.</p></article>
          </div>
        </section>
      </main>

      <footer className="store-footer">
        <div className="footer-inner">
          <div><BrandLogo inverse /><p>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</p></div>
          <div className="footer-links"><a href="mailto:support@bjelectronics.shop">Support</a><a href={adminUrl}>Administration</a></div>
        </div>
      </footer>
    </div>
  );
}
