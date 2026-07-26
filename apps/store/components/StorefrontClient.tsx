"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@bje/database";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { ProductCard } from "@/components/ProductCard";
import { ProductArtwork } from "@/components/ProductArtwork";
import { marketplaceBrands, marketplaceCategories } from "@/lib/marketplace";

function categoryMatches(product: Product, keywords: string[]): boolean {
  const text = `${product.name} ${product.description} ${product.sku}`.toLowerCase();
  return keywords.some((term) => text.includes(term));
}

function remainingToday(): string {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const seconds = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs].map((value) => String(value).padStart(2, "0")).join(":");
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
        // The catalog refresh below remains authoritative when an event payload is malformed.
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

  const newArrivals = useMemo(
    () => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [products],
  );
  const discounted = useMemo(
    () => products.filter((product) => product.compareAtCents && product.compareAtCents > product.priceCents).slice(0, 6),
    [products],
  );
  const flashDeals = discounted.length ? discounted : products.slice(0, 6);
  const bestSellers = useMemo(() => products.slice(0, 8), [products]);
  const heroProduct = products[0];

  return (
    <div className="store-shell marketplace-storefront">
      <StoreHeader adminUrl={adminUrl} />
      <main>
        <section className="marketplace-hero-shell" aria-labelledby="marketplace-hero-title">
          <aside className="hero-category-rail" aria-label="Popular categories">
            <div className="category-rail-title"><span>☰</span><strong>Shop categories</strong></div>
            {marketplaceCategories.slice(0, 9).map((category) => (
              <Link key={category.key} href={`/categories?category=${encodeURIComponent(category.label)}`}>
                <span className="rail-category-icon">{category.icon}</span>
                <span><strong>{category.label}</strong><small>{products.filter((product) => categoryMatches(product, category.keywords)).length || "Explore"} products</small></span>
                <b>›</b>
              </Link>
            ))}
            <Link className="rail-view-all" href="/categories"><span>＋</span><span><strong>View all categories</strong><small>Browse the complete catalog</small></span><b>›</b></Link>
          </aside>

          <div className="marketplace-hero-card">
            <div className="marketplace-hero-copy">
              <span className="marketplace-label">BJ Electronics mega tech store</span>
              <h1 id="marketplace-hero-title">Technology for every part of your day.</h1>
              <p>Shop trusted electronics and appliances with live inventory, transparent pricing, secure checkout and nationwide delivery support.</p>
              <div className="marketplace-hero-actions">
                <Link className="marketplace-primary" href="/categories">Shop all products</Link>
                <Link className="marketplace-secondary" href={heroProduct ? `/products/${heroProduct.slug}` : "/categories"}>View featured deal</Link>
              </div>
              <div className="marketplace-hero-proof"><span>Official warranty</span><span>Easy returns</span><span>Order support</span></div>
            </div>
            <div className="marketplace-featured-product">
              {heroProduct ? <ProductArtwork product={heroProduct} /> : <div className="marketplace-device-art"><i /><i /><strong>BJ</strong></div>}
              <div><small>Featured today</small><strong>{heroProduct?.name ?? "Premium electronics collection"}</strong>{heroProduct ? <Link href={`/products/${heroProduct.slug}`}>Shop now →</Link> : null}</div>
            </div>
          </div>

          <div className="marketplace-promo-stack">
            <Link className="marketplace-promo-card promo-delivery" href="/categories?sort=newest">
              <span>New arrivals</span><strong>Fresh technology, ready to ship.</strong><small>Explore the latest catalog →</small>
            </Link>
            <Link className="marketplace-promo-card promo-appliances" href="/categories?category=Home%20Appliances">
              <span>Home upgrade</span><strong>Smart appliances for modern living.</strong><small>Shop home technology →</small>
            </Link>
          </div>
        </section>

        <section className="marketplace-service-strip" aria-label="Shopping services">
          <article><span>🚚</span><div><strong>Nationwide delivery</strong><small>Reliable delivery across Bangladesh</small></div></article>
          <article><span>✓</span><div><strong>Quality checked</strong><small>Clear specifications and stock status</small></div></article>
          <article><span>↻</span><div><strong>Easy return support</strong><small>Responsive assistance after purchase</small></div></article>
          <article><span>▣</span><div><strong>Secure checkout</strong><small>Cash on delivery or bank transfer</small></div></article>
        </section>

        <section className="marketplace-section flash-sale-section">
          <div className="marketplace-section-heading flash-heading">
            <div><span className="section-badge">Flash sale</span><h2>Today&apos;s technology deals</h2><p>Limited-time pricing while current inventory lasts.</p></div>
            <div className="deal-clock" aria-label={`Deals end in ${dealClock}`}><small>Ends in</small><strong>{dealClock}</strong><Link href="/categories?sort=discount">View all deals</Link></div>
          </div>
          {flashDeals.length ? <div className="marketplace-product-row">{flashDeals.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Discounted products will appear here when configured in the catalog.</div>}
        </section>

        <section className="marketplace-section category-marketplace-section">
          <div className="marketplace-section-heading"><div><span>Browse faster</span><h2>Featured categories</h2><p>Find the right technology in fewer steps.</p></div><Link href="/categories">View all categories</Link></div>
          <div className="marketplace-category-grid">
            {marketplaceCategories.slice(0, 8).map((category, index) => (
              <Link className={`marketplace-category-card category-tone-${(index % 4) + 1}`} href={`/categories?category=${encodeURIComponent(category.label)}`} key={category.key}>
                <span className="marketplace-category-icon">{category.icon}</span>
                <div><strong>{category.label}</strong><small>{category.description}</small></div>
                <b>Shop now →</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="marketplace-section marketplace-collection-section">
          <div className="marketplace-section-heading"><div><span>Popular right now</span><h2>Best-selling technology</h2><p>Customer favourites selected from the live product catalog.</p></div><div className="heading-actions"><span className={`catalog-live${live ? " connected" : ""}`}>{live ? "Live inventory" : "Connecting"}</span><Link href="/categories">View all</Link></div></div>
          {bestSellers.length ? <div className="marketplace-product-grid">{bestSellers.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Published products will appear here automatically.</div>}
        </section>

        <section className="marketplace-campaign-grid">
          <article className="campaign-card campaign-entertainment"><div><span>Upgrade your living room</span><h2>Big-screen entertainment for films, sports and gaming.</h2><Link href="/categories?category=TV%20%26%20Entertainment">Shop televisions</Link></div><div className="campaign-tv" aria-hidden="true"><span><i /></span><b /></div></article>
          <article className="campaign-card campaign-kitchen"><div><span>Everyday convenience</span><h2>Reliable kitchen and home appliances.</h2><Link href="/categories?category=Kitchen%20Appliances">Shop appliances</Link></div><div className="campaign-appliance" aria-hidden="true"><i /><i /><strong>+</strong></div></article>
        </section>

        <section className="marketplace-section new-arrival-marketplace-section">
          <div className="marketplace-section-heading"><div><span>Just added</span><h2>New arrivals</h2><p>Recently published products from the BJ Electronics catalog.</p></div><Link href="/categories?sort=newest">See all new arrivals</Link></div>
          {newArrivals.length ? <div className="marketplace-product-row">{newArrivals.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">New products will appear as soon as they are published.</div>}
        </section>

        <section className="marketplace-brand-section">
          <div><span>Shop trusted names</span><h2>Popular technology brands</h2><p>Explore products from leading electronics manufacturers represented in the catalog.</p></div>
          <div className="brand-pill-grid">{marketplaceBrands.map((brand) => <Link key={brand} href={`/categories?q=${encodeURIComponent(brand)}`}>{brand}</Link>)}</div>
        </section>

        <section className="marketplace-confidence-section">
          <div className="confidence-copy"><span>Smart tech, better life</span><h2>A marketplace experience built around trust.</h2><p>BJ Electronics combines a responsive storefront with live inventory, protected cart sessions, transactional checkout and direct operational control from the secure administration platform.</p><div><a href="mailto:support@bjelectronics.shop">Contact support</a><Link href="/categories">Start shopping</Link></div></div>
          <div className="confidence-grid"><article><strong>01</strong><h3>Reliable products</h3><p>Live availability and controlled publication from one operational source of truth.</p></article><article><strong>02</strong><h3>Clear fulfilment</h3><p>Orders reserve inventory and carry complete customer and delivery information.</p></article><article><strong>03</strong><h3>Responsive service</h3><p>Support links remain available throughout browsing, cart and checkout.</p></article><article><strong>04</strong><h3>Secure operations</h3><p>The administration application remains isolated from the public storefront.</p></article></div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
