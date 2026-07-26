"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@bje/database";
import { ProductCard } from "@/components/ProductCard";
import { ProductArtwork } from "@/components/ProductArtwork";
import { StoreFooter } from "@/components/StoreFooter";
import { StoreHeader } from "@/components/StoreHeader";

const categories = [
  { name: "Laptops", icon: "▰", description: "Portable performance" },
  { name: "Earphones", icon: "◖", description: "Wireless everyday audio" },
  { name: "Headphones", icon: "◉", description: "Immersive listening" },
  { name: "Smart Watches", icon: "▣", description: "Connected wellness" },
  { name: "Speakers", icon: "◼", description: "Powerful home sound" },
  { name: "Accessories", icon: "⌁", description: "Chargers, hubs and cables" },
  { name: "Monitors", icon: "▤", description: "Productive displays" },
  { name: "Power Banks", icon: "▥", description: "Reliable mobile power" },
] as const;

const collectionDefinitions = [
  { title: "Laptops & Computing", query: "Laptops", keywords: ["laptop", "macbook", "notebook", "computer", "monitor"] },
  { title: "Audio Essentials", query: "Headphones", keywords: ["headphone", "earphone", "airpod", "speaker", "audio", "sound"] },
  { title: "Smart Lifestyle", query: "Smart Watches", keywords: ["watch", "wearable", "smart", "fitness"] },
  { title: "Power & Accessories", query: "Accessories", keywords: ["charger", "power", "cable", "adapter", "accessory", "hub"] },
] as const;

function money(product: Product): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency }).format(product.priceCents / 100);
}

function matches(product: Product, keywords: readonly string[]): boolean {
  const source = `${product.name} ${product.sku} ${product.description}`.toLowerCase();
  return keywords.some((keyword) => source.includes(keyword));
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [visibleDemand, setVisibleDemand] = useState(8);
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
        // The authoritative catalog refresh remains safe when an event is malformed.
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

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % 3), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const topDemand = useMemo(
    () => [...products].sort((a, b) => (b.inventoryQuantity + (b.compareAtCents ? 4 : 0)) - (a.inventoryQuantity + (a.compareAtCents ? 4 : 0))),
    [products],
  );
  const heroProducts = products.slice(0, 3);
  const activeProduct = heroProducts[activeSlide] ?? products[0];
  const collections = useMemo(
    () => collectionDefinitions.map((definition, index) => {
      const exact = products.filter((product) => matches(product, definition.keywords));
      const fallback = products.slice(index * 4, index * 4 + 4);
      return { ...definition, products: (exact.length ? exact : fallback).slice(0, 4) };
    }),
    [products],
  );

  const slides = [
    {
      kicker: "Official BJ Electronics online store",
      title: "Smarter technology. Better everyday living.",
      description: "Shop dependable computing, audio, wearables and accessories with live inventory and secure order processing.",
      action: "Shop technology",
      href: "/categories",
    },
    {
      kicker: "Performance collection",
      title: activeProduct ? activeProduct.name : "Premium performance, made accessible.",
      description: activeProduct?.description || "Carefully selected devices for study, work, entertainment and connected living.",
      action: activeProduct ? "View featured product" : "Explore new arrivals",
      href: activeProduct ? `/products/${activeProduct.slug}` : "/categories?sort=newest",
    },
    {
      kicker: "Service you can trust",
      title: "Genuine products with responsive local support.",
      description: "Transparent pricing, official warranty guidance, straightforward returns and nationwide delivery coordination.",
      action: "Browse top demand",
      href: "#top-demand",
    },
  ] as const;
  const slide = slides[activeSlide] ?? slides[0];

  return (
    <div className="store-shell caravan-reference-storefront">
      <StoreHeader adminUrl={adminUrl} />
      <main>
        <section className="caravan-hero" aria-labelledby="caravan-hero-title">
          <div className="caravan-hero-copy">
            <p className="caravan-kicker">{slide.kicker}</p>
            <h1 id="caravan-hero-title">{slide.title}</h1>
            <p>{slide.description}</p>
            <div className="caravan-hero-actions">
              <Link className="shop-primary" href={slide.href}>{slide.action}</Link>
              <a className="shop-secondary" href="mailto:support@bjelectronics.shop">Contact support</a>
            </div>
            <div className="caravan-proof-row">
              <span>✓ Genuine products</span><span>✓ Secure checkout</span><span>✓ Nationwide support</span>
            </div>
          </div>
          <div className="caravan-hero-stage">
            <div className="hero-stage-ring" />
            {activeProduct ? (
              <div className="hero-stage-product">
                <ProductArtwork product={activeProduct} />
                <div><small>Featured now</small><strong>{activeProduct.name}</strong><span>{money(activeProduct)}</span></div>
              </div>
            ) : (
              <div className="hero-stage-placeholder"><strong>BJ</strong><span>Smart tech, better life.</span></div>
            )}
          </div>
          <div className="caravan-slider-controls" aria-label="Hero slides">
            <button type="button" onClick={() => setActiveSlide((activeSlide + 2) % 3)} aria-label="Previous slide">←</button>
            <div>{slides.map((item, index) => <button className={index === activeSlide ? "active" : ""} type="button" key={item.kicker} onClick={() => setActiveSlide(index)} aria-label={`Show slide ${index + 1}`} />)}</div>
            <button type="button" onClick={() => setActiveSlide((activeSlide + 1) % 3)} aria-label="Next slide">→</button>
          </div>
        </section>

        <section className="caravan-category-strip" aria-label="Featured categories">
          {categories.slice(0, 5).map((category) => (
            <Link href={`/categories?category=${encodeURIComponent(category.name)}`} key={category.name}>
              <span>{category.icon}</span><div><strong>{category.name}</strong><small>{category.description}</small></div>
            </Link>
          ))}
        </section>

        <section className="caravan-trust-strip" aria-label="Shopping benefits">
          <article><span>▱</span><div><strong>Nationwide delivery</strong><small>Coordinated across Bangladesh</small></div></article>
          <article><span>♢</span><div><strong>Warranty support</strong><small>Clear official coverage guidance</small></div></article>
          <article><span>↻</span><div><strong>Easy assistance</strong><small>Responsive order and return support</small></div></article>
          <article><span>▣</span><div><strong>Secure ordering</strong><small>Inventory checked at checkout</small></div></article>
        </section>

        <section className="caravan-section" id="top-demand">
          <div className="caravan-section-heading">
            <div><span>Popular right now</span><h2>Top Demand</h2><p>High-interest products selected from the live BJ Electronics catalog.</p></div>
            <div className="heading-actions"><span className={`catalog-live${live ? " connected" : ""}`}>{live ? "Live inventory" : "Connecting"}</span><Link href="/categories">View all</Link></div>
          </div>
          {topDemand.length ? (
            <>
              <div className="caravan-product-grid">{topDemand.slice(0, visibleDemand).map((product) => <ProductCard compact product={product} key={product.id} />)}</div>
              {visibleDemand < topDemand.length ? <button className="load-more-button" type="button" onClick={() => setVisibleDemand((count) => count + 4)}>Load more products</button> : null}
            </>
          ) : <div className="empty-state">Products will appear here as soon as the catalog is published.</div>}
        </section>

        <section className="caravan-feature-banner">
          <div><span>Smart tech, better life.</span><h2>Technology selected for real daily needs.</h2><p>From dependable workstations to personal audio and everyday charging, BJ Electronics keeps the catalog focused, useful and supported.</p><Link href="/categories?sort=newest">Discover what is new</Link></div>
          <div className="feature-banner-visual" aria-hidden="true"><span>BJ</span><i /><i /></div>
        </section>

        {collections.map((collection) => (
          <section className="caravan-section collection-shelf" key={collection.title}>
            <div className="caravan-section-heading compact-heading"><div><span>Curated collection</span><h2>{collection.title}</h2></div><Link href={`/categories?category=${encodeURIComponent(collection.query)}`}>View all</Link></div>
            {collection.products.length ? <div className="caravan-product-grid shelf-grid">{collection.products.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">This collection is being prepared.</div>}
          </section>
        ))}

        <section className="caravan-service-panel">
          <div><span>Why BJ Electronics</span><h2>Quality, trust and practical service.</h2><p>Our storefront connects directly to operational inventory and order workflows so product availability, pricing and fulfilment remain coordinated.</p></div>
          <div className="service-panel-grid">
            <article><b>01</b><strong>Controlled catalog</strong><p>Products are published and maintained through the secure administration application.</p></article>
            <article><b>02</b><strong>Transactional checkout</strong><p>Stock and price are revalidated before every order is accepted.</p></article>
            <article><b>03</b><strong>Responsive support</strong><p>Customers can reach the team for delivery, warranty and order assistance.</p></article>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
