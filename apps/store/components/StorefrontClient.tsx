"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@bje/database";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { ProductCard } from "@/components/ProductCard";
import { ProductArtwork } from "@/components/ProductArtwork";
import { marketplaceBrands, marketplaceCategories } from "@/lib/marketplace";

function remainingToday(): string {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const seconds = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
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
  const [dealClock, setDealClock] = useState(remainingToday());
  const cursor = useRef(latestEventId);

  useEffect(() => {
    const timer = window.setInterval(() => setDealClock(remainingToday()), 1000);
    const source = new EventSource(`/api/realtime?after=${cursor.current}`);
    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false);
    source.addEventListener("commerce", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent<string>).data) as { id?: number };
        if (typeof payload.id === "number") cursor.current = payload.id;
      } catch {
        // The authoritative catalog request below remains safe when an event payload is malformed.
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
      window.clearInterval(timer);
      source.close();
    };
  }, []);

  const heroProduct = products[0];
  const newest = useMemo(() => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6), [products]);
  const deals = useMemo(() => [...products].sort((a, b) => ((b.compareAtCents ?? b.priceCents) - b.priceCents) - ((a.compareAtCents ?? a.priceCents) - a.priceCents)).slice(0, 6), [products]);
  const featured = useMemo(() => products.slice(0, 10), [products]);

  return (
    <div className="store-shell market-storefront">
      <StoreHeader adminUrl={adminUrl} />
      <main className="market-home">
        <section className="market-hero-layout" aria-labelledby="market-hero-title">
          <aside className="hero-departments" aria-label="Popular departments">
            <strong>Top departments</strong>
            {marketplaceCategories.slice(0, 8).map((category) => (
              <Link href={`/categories?category=${encodeURIComponent(category.label)}`} key={category.key}>
                <span>{category.icon}</span><div><b>{category.short}</b><small>{category.description}</small></div><i>›</i>
              </Link>
            ))}
          </aside>

          <article className="market-hero-primary">
            <div className="market-hero-copy">
              <span className="campaign-label">BJ home upgrade event</span>
              <h1 id="market-hero-title">Make every room <em>smarter.</em></h1>
              <p>Explore dependable electronics and home appliances with transparent pricing, nationwide delivery and responsive after-sales support.</p>
              <div className="market-hero-actions"><Link href="/categories" className="market-primary-button">Shop all products</Link><Link href="/categories?sort=discount" className="market-outline-button">Explore offers</Link></div>
              <div className="campaign-points"><span>Official warranty</span><span>Secure ordering</span><span>Live inventory</span></div>
            </div>
            <div className="market-hero-product">
              <div className="hero-appliance-stage">{heroProduct ? <ProductArtwork product={heroProduct} priority /> : <div className="market-art market-tv"><span className="market-screen"><i /><i /><i /></span><span className="market-stand" /></div>}</div>
              <div className="hero-price-card"><small>Featured collection</small><strong>{heroProduct?.name ?? "Smart home technology"}</strong>{heroProduct ? <Link href={`/products/${heroProduct.slug}`}>View product →</Link> : <Link href="/categories">Browse catalog →</Link>}</div>
            </div>
          </article>

          <div className="market-hero-side">
            <article className="hero-side-card cooling"><div><span>Cooling season</span><h2>Energy-efficient air care</h2><Link href="/categories?category=Air%20Conditioners">Shop cooling →</Link></div><i>❄</i></article>
            <article className="hero-side-card kitchen"><div><span>Kitchen essentials</span><h2>Convenience for every meal</h2><Link href="/categories?category=Kitchen%20Appliances">Shop kitchen →</Link></div><i>◫</i></article>
          </div>
        </section>

        <section className="market-benefits" aria-label="Store benefits">
          <article><span>🚚</span><div><strong>Nationwide delivery</strong><small>Reliable fulfilment across Bangladesh</small></div></article>
          <article><span>♢</span><div><strong>Official warranty</strong><small>Clear product support and coverage</small></div></article>
          <article><span>↻</span><div><strong>Easy assistance</strong><small>Support before and after purchase</small></div></article>
          <article><span>▣</span><div><strong>Secure checkout</strong><small>Inventory validated before confirmation</small></div></article>
        </section>

        <section className="market-section category-market-section">
          <div className="market-section-heading"><div><span>Browse the marketplace</span><h2>Shop by category</h2><p>Everything from home appliances to personal technology in one trusted store.</p></div><Link href="/categories">View all categories</Link></div>
          <div className="market-category-grid">
            {marketplaceCategories.map((category) => (
              <Link href={`/categories?category=${encodeURIComponent(category.label)}`} className={`market-category-card category-${category.key}`} key={category.key}>
                <div className="market-category-icon"><span>{category.icon}</span></div><strong>{category.label}</strong><small>{category.description}</small><i>Shop now →</i>
              </Link>
            ))}
          </div>
        </section>

        <section className="market-section deal-section">
          <div className="deal-heading">
            <div><span className="deal-badge">Hot offers</span><h2>Today&apos;s best deals</h2><p>Save on selected products while current inventory is available.</p></div>
            <div className="deal-status"><small>Ends in</small><strong>{dealClock}</strong><span className={live ? "online" : ""}>{live ? "Live prices connected" : "Connecting to catalog"}</span><Link href="/categories?sort=discount">See every deal</Link></div>
          </div>
          {deals.length ? <div className="market-product-row">{deals.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Published deals will appear here from the administration catalog.</div>}
        </section>

        <section className="brand-market-section">
          <div className="market-section-heading compact"><div><span>Trusted technology</span><h2>Shop leading brands</h2></div><Link href="/categories">Browse all products</Link></div>
          <div className="market-brand-grid">{marketplaceBrands.map((brand) => <Link href={`/categories?brand=${encodeURIComponent(brand)}`} key={brand}><span>{brand}</span><small>Explore products</small></Link>)}</div>
        </section>

        <section className="market-campaign-grid">
          <article className="campaign-card television-campaign"><div><span>Entertainment upgrade</span><h2>Big-screen experiences for every home.</h2><p>Discover smart televisions, audio systems and connected entertainment.</p><Link href="/categories?category=TV%20%26%20Entertainment">Shop entertainment</Link></div><div className="campaign-art tv-campaign-art"><i /><i /><strong>BJ</strong></div></article>
          <article className="campaign-card appliance-campaign"><div><span>Home appliance event</span><h2>Reliable performance for everyday living.</h2><p>Explore refrigerators, washing machines and kitchen essentials.</p><Link href="/categories?category=Refrigerators%20%26%20Freezers">Shop appliances</Link></div><div className="campaign-art appliance-campaign-art"><i /><span /></div></article>
        </section>

        <section className="market-section featured-market-section">
          <div className="market-section-heading"><div><span>Popular right now</span><h2>Featured products</h2><p>Customer favourites selected from the live BJ Electronics catalog.</p></div><div className="heading-actions"><span className={`catalog-live${live ? " connected" : ""}`}>{live ? "Live inventory" : "Connecting"}</span><Link href="/categories">View all products</Link></div></div>
          {featured.length ? <div className="market-product-grid">{featured.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Products will appear automatically after publication.</div>}
        </section>

        <section className="market-lifestyle-grid">
          <article className="lifestyle-card living-room"><span>Living room</span><h2>Entertainment that brings everyone together.</h2><Link href="/categories?category=TV%20%26%20Entertainment">Explore the collection →</Link><div className="room-art"><i /><b /></div></article>
          <article className="lifestyle-card smart-kitchen"><span>Kitchen</span><h2>Practical appliances for easier preparation.</h2><Link href="/categories?category=Kitchen%20Appliances">Explore the collection →</Link><div className="kitchen-art"><i /><b /></div></article>
          <article className="lifestyle-card home-comfort"><span>Home comfort</span><h2>Cooling and care for every season.</h2><Link href="/categories?category=Air%20Conditioners">Explore the collection →</Link><div className="comfort-art"><i /><b /></div></article>
        </section>

        <section className="market-section new-market-section">
          <div className="market-section-heading"><div><span>Just arrived</span><h2>New products</h2><p>Recently published products from the BJ Electronics operations platform.</p></div><Link href="/categories?sort=newest">View all new arrivals</Link></div>
          {newest.length ? <div className="market-product-row">{newest.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">New products will appear here as soon as they are published.</div>}
        </section>

        <section className="market-confidence">
          <div><span>Smart tech, better life</span><h2>Built around trust, service and real inventory.</h2><p>BJ Electronics combines a broad appliance marketplace experience with transactional carts, secure order creation and direct operational control from the administration platform.</p><div className="confidence-actions"><Link href="/categories">Start shopping</Link><a href="mailto:support@bjelectronics.shop">Contact support</a></div></div>
          <div className="confidence-cards"><article><strong>01</strong><h3>Authentic catalog</h3><p>Published products and pricing come from one controlled source of truth.</p></article><article><strong>02</strong><h3>Clear availability</h3><p>Live stock indicators help customers make informed decisions.</p></article><article><strong>03</strong><h3>Secure orders</h3><p>Inventory is revalidated and reserved during checkout.</p></article><article><strong>04</strong><h3>Responsive support</h3><p>Help remains accessible throughout the shopping journey.</p></article></div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
