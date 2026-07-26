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

const collections = [
  { title: "Laptops & Computing", category: "Laptops", description: "Portable performance for study, work and creative projects.", terms: ["laptop", "notebook", "macbook", "computer", "monitor", "display"] },
  { title: "Personal Audio", category: "Headphones", description: "Earphones, headphones and speakers for focused listening.", terms: ["earphone", "earbud", "airpod", "headphone", "speaker", "audio", "sound"] },
  { title: "Smart Lifestyle", category: "Smart Watches", description: "Connected wearables and practical everyday technology.", terms: ["watch", "wearable", "smart", "fitness", "tracker"] },
  { title: "Power & Accessories", category: "Accessories", description: "Charging, connectivity and protection for every device.", terms: ["power", "charger", "cable", "adapter", "accessory", "case", "hub", "bank"] },
];

function productText(product: Product): string {
  return `${product.name} ${product.sku} ${product.description}`.toLowerCase();
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
  const topDemand = useMemo(() => [...products].sort((a, b) => {
    const aDiscount = a.compareAtCents ? a.compareAtCents - a.priceCents : 0;
    const bDiscount = b.compareAtCents ? b.compareAtCents - b.priceCents : 0;
    if (bDiscount !== aDiscount) return bDiscount - aDiscount;
    return b.inventoryQuantity - a.inventoryQuantity;
  }).slice(0, 10), [products]);
  const heroProduct = topDemand[0] ?? products[0];

  const collectionProducts = useMemo(() => collections.map((collection, index) => {
    const matched = products.filter((product) => collection.terms.some((term) => productText(product).includes(term)));
    const fallback = products.slice(index * 5, index * 5 + 5);
    return { ...collection, products: (matched.length ? matched : fallback).slice(0, 5) };
  }), [products]);

  return (
    <div className="store-shell reference-storefront caravan-merchandising">
      <StoreHeader adminUrl={adminUrl} />
      <main>
        <section className="retail-hero" aria-labelledby="hero-title">
          <div className="retail-hero-copy">
            <p className="hero-kicker">Quality technology. Trusted service.</p>
            <h1 id="hero-title">Everything you need for a <span>smarter connected life.</span></h1>
            <p>Explore a structured electronics marketplace with clear categories, live stock, secure checkout and straightforward support throughout Bangladesh.</p>
            <div className="retail-hero-actions"><Link className="shop-primary" href="/shop">Shop now</Link><Link className="shop-secondary" href="/contact">Contact support</Link></div>
            <div className="hero-mini-proof"><span>✓ Live stock</span><span>✓ Secure ordering</span><span>✓ Responsive support</span></div>
          </div>
          <div className="retail-hero-visual" aria-label={heroProduct ? `Featured product: ${heroProduct.name}` : "Featured technology collection"}>
            <div className="hero-glow" />
            <div className="hero-laptop">
              <div className="hero-laptop-screen"><i /><i /><i /><span>BJ</span></div>
              <div className="hero-laptop-base" />
            </div>
            <div className="hero-product-label"><small>Top demand</small><strong>{heroProduct?.name ?? "Premium technology collection"}</strong><Link href={heroProduct ? `/products/${heroProduct.slug}` : "/shop"}>Explore product →</Link></div>
          </div>
          <div className="hero-dots" aria-hidden="true"><span className="active" /><span /><span /><span /></div>
        </section>

        <section className="retail-trust" aria-label="Shopping benefits">
          <article><span>▱</span><div><strong>Nationwide delivery</strong><small>Order from anywhere in Bangladesh</small></div></article>
          <article><span>♢</span><div><strong>Warranty support</strong><small>Clear product coverage</small></div></article>
          <article><span>↻</span><div><strong>Easy assistance</strong><small>Support before and after purchase</small></div></article>
          <article><span>▣</span><div><strong>Secure checkout</strong><small>Protected cart and order flow</small></div></article>
        </section>

        <section className="retail-section category-section">
          <div className="retail-section-heading"><div><span>Explore the store</span><h2>Shop by category</h2></div><Link href="/shop">View all</Link></div>
          <div className="category-tile-grid">
            {categories.map((category) => (
              <Link className="category-tile" href={`/shop?category=${encodeURIComponent(category.name)}`} key={category.name}>
                <span className="category-tile-icon">{category.icon}</span><strong>{category.name}</strong><small>{category.description}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="retail-section demand-section">
          <div className="retail-section-heading"><div><span>Popular right now</span><h2>Top demand</h2></div><div className="heading-actions"><span className={`catalog-live${live ? " connected" : ""}`}>{live ? "Live inventory" : "Connecting"}</span><Link href="/shop?sort=discount">View all</Link></div></div>
          {topDemand.length ? <div className="featured-product-grid demand-product-grid">{topDemand.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Products will appear here as soon as the catalog is published.</div>}
        </section>

        <section className="retail-section new-arrival-band">
          <div className="retail-section-heading"><div><span>Recently published</span><h2>New arrivals</h2></div><Link href="/shop?sort=newest">View all</Link></div>
          {newArrivals.length ? <div className="horizontal-product-grid">{newArrivals.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">No new arrivals are currently available.</div>}
        </section>

        {collectionProducts.map((collection, index) => (
          <section className={`retail-section collection-shelf collection-shelf-${index + 1}`} key={collection.title}>
            <div className="retail-section-heading">
              <div><span>Curated collection</span><h2>{collection.title}</h2><p>{collection.description}</p></div>
              <Link href={`/shop?category=${encodeURIComponent(collection.category)}`}>View all</Link>
            </div>
            {collection.products.length ? <div className="horizontal-product-grid collection-product-grid">{collection.products.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">This collection will appear when matching products are published.</div>}
          </section>
        ))}

        <section className="promotion-grid">
          <article className="promotion-card promo-a"><div><span>Focused listening</span><h2>Premium headphones</h2><p>Comfortable sound for work, travel and everyday listening.</p><Link href="/shop?category=Headphones">Shop headphones</Link></div><div className="promo-headphones" aria-hidden="true"><span /><i /><i /></div></article>
          <article className="promotion-card promo-b"><div><span>Connected lifestyle</span><h2>Smart watches</h2><p>Track, connect and achieve more throughout your day.</p><Link href="/shop?category=Smart%20Watches">Shop smart watches</Link></div><div className="promo-watch" aria-hidden="true"><span><i /></span></div></article>
          <article className="promotion-card promo-c"><div><span>Power anywhere</span><h2>Essential accessories</h2><p>Reliable charging, connectivity and device protection.</p><Link href="/shop?category=Accessories">Shop accessories</Link></div><div className="promo-power" aria-hidden="true"><span /><i /></div></article>
        </section>

        <section className="service-contact-band">
          <div><span>Need help choosing?</span><h2>Talk to BJ Electronics before you order.</h2><p>Product questions, availability checks and order support are available through the dedicated contact page.</p></div>
          <Link href="/contact">Contact customer support</Link>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
