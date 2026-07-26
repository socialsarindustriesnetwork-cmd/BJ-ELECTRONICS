"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@bje/database";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { ProductCard } from "@/components/ProductCard";

const categories = [
  { name: "Laptops", icon: "▰", description: "Powerful mobile computing" },
  { name: "Earphones", icon: "◖", description: "Compact wireless audio" },
  { name: "Headphones", icon: "◉", description: "Immersive personal sound" },
  { name: "Smart Watches", icon: "▣", description: "Connected daily wellness" },
  { name: "Speakers", icon: "◼", description: "Room-filling entertainment" },
  { name: "Accessories", icon: "⌁", description: "Cables, chargers and more" },
  { name: "Monitors", icon: "▤", description: "Clear productive displays" },
  { name: "Power Banks", icon: "▥", description: "Power wherever you go" },
];

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
  const [live, setLive] = useState(false);
  const cursor = useRef(latestEventId);

  useEffect(() => {
    const source = new EventSource(`/api/realtime?after=${cursor.current}`);
    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false);
    source.addEventListener("commerce", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent<string>).data) as { id?: number };
        if (typeof payload.id === "number") cursor.current = payload.id;
      } catch {
        // The authoritative catalog request below remains safe when an event is malformed.
      }
      void fetch("/api/catalog", { cache: "no-store" })
        .then((response) => response.json())
        .then((payload: { products?: Product[]; latestEventId?: number }) => {
          if (payload.products) setProducts(payload.products);
          if (typeof payload.latestEventId === "number") cursor.current = payload.latestEventId;
        })
        .catch(() => undefined);
    });
    return () => source.close();
  }, []);

  const newArrivals = useMemo(() => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5), [products]);
  const featured = useMemo(() => products.slice(0, 10), [products]);
  const heroProduct = products[0];

  return (
    <div className="store-shell reference-storefront">
      <StoreHeader adminUrl={adminUrl} />
      <main>
        <section className="retail-hero" aria-labelledby="hero-title">
          <div className="retail-hero-copy">
            <p className="hero-kicker">Powerful performance. Dependable service.</p>
            <h1 id="hero-title">Smart technology for a <span>better everyday life.</span></h1>
            <p>Discover carefully selected laptops, audio, wearables and accessories with live inventory, secure checkout and responsive support.</p>
            <div className="retail-hero-actions"><Link className="shop-primary" href="/categories">Shop now</Link><a className="shop-secondary" href="mailto:support@bjelectronics.shop">Talk to an expert</a></div>
            <div className="hero-mini-proof"><span>✓ Live stock</span><span>✓ Secure checkout</span><span>✓ Fast support</span></div>
          </div>
          <div className="retail-hero-visual" aria-label={heroProduct ? `Featured product: ${heroProduct.name}` : "Featured laptop collection"}>
            <div className="hero-glow" />
            <div className="hero-laptop">
              <div className="hero-laptop-screen"><i /><i /><i /><span>BJ</span></div>
              <div className="hero-laptop-base" />
            </div>
            <div className="hero-product-label"><small>Featured technology</small><strong>{heroProduct?.name ?? "Premium performance collection"}</strong><Link href={heroProduct ? `/products/${heroProduct.slug}` : "/categories"}>Explore product →</Link></div>
          </div>
          <div className="hero-dots" aria-hidden="true"><span className="active" /><span /><span /><span /></div>
        </section>

        <section className="retail-trust" aria-label="Shopping benefits">
          <article><span>▱</span><div><strong>Free delivery</strong><small>On qualifying orders</small></div></article>
          <article><span>♢</span><div><strong>1 year warranty</strong><small>Official product coverage</small></div></article>
          <article><span>↻</span><div><strong>Easy returns</strong><small>Clear return assistance</small></div></article>
          <article><span>▣</span><div><strong>Secure payment</strong><small>Protected checkout</small></div></article>
        </section>

        <section className="retail-section category-section">
          <div className="retail-section-heading"><div><span>Explore the store</span><h2>Shop by category</h2></div><Link href="/categories">View all</Link></div>
          <div className="category-tile-grid">
            {categories.map((category) => (
              <Link className="category-tile" href={`/categories?category=${encodeURIComponent(category.name)}`} key={category.name}>
                <span className="category-tile-icon">{category.icon}</span><strong>{category.name}</strong><small>{category.description}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="retail-section">
          <div className="retail-section-heading"><div><span>Fresh technology</span><h2>New arrivals</h2></div><div className="heading-actions"><span className={`catalog-live${live ? " connected" : ""}`}>{live ? "Live inventory" : "Connecting"}</span><Link href="/categories?sort=newest">View all</Link></div></div>
          {newArrivals.length ? <div className="horizontal-product-grid">{newArrivals.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Products will appear here as soon as the catalog is published.</div>}
        </section>

        <section className="retail-section featured-section">
          <div className="retail-section-heading"><div><span>Customer favourites</span><h2>Featured products</h2></div><Link href="/categories">View all</Link></div>
          {featured.length ? <div className="featured-product-grid">{featured.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">No featured products are currently available.</div>}
        </section>

        <section className="promotion-grid">
          <article className="promotion-card promo-a"><div><span>Up to 25% off</span><h2>Premium headphones</h2><p>Focused sound for work, travel and everyday listening.</p><Link href="/categories?category=Headphones">Shop headphones</Link></div><div className="promo-headphones" aria-hidden="true"><span /><i /><i /></div></article>
          <article className="promotion-card promo-b"><div><span>Connected lifestyle</span><h2>Smart watches</h2><p>Track, connect and achieve more throughout your day.</p><Link href="/categories?category=Smart%20Watches">Shop smart watches</Link></div><div className="promo-watch" aria-hidden="true"><span><i /></span></div></article>
          <article className="promotion-card promo-c"><div><span>Power anywhere</span><h2>Essential accessories</h2><p>Reliable charging, connectivity and protection.</p><Link href="/categories?category=Accessories">Shop accessories</Link></div><div className="promo-power" aria-hidden="true"><span /><i /></div></article>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
