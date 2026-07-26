"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@bje/database";
import { DealCountdown } from "@/components/DealCountdown";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { ProductCard } from "@/components/ProductCard";

const categories = [
  { name: "Laptops", icon: "▰", description: "Work, study and create" },
  { name: "Earphones", icon: "◖", description: "Wireless everyday audio" },
  { name: "Headphones", icon: "◉", description: "Immersive listening" },
  { name: "Smart Watches", icon: "▣", description: "Connected wellness" },
  { name: "Speakers", icon: "◼", description: "Portable entertainment" },
  { name: "Accessories", icon: "⌁", description: "Cables, hubs and cases" },
  { name: "Monitors", icon: "▤", description: "Clear productive displays" },
  { name: "Power Banks", icon: "▥", description: "Power wherever you go" },
];

const slides = [
  { eyebrow: "Premium computing", title: "Powerful performance for work and creativity.", copy: "Discover dependable laptops, displays and accessories selected for productive everyday use.", category: "Laptops", cta: "Shop computing", tone: "blue" },
  { eyebrow: "Personal audio", title: "Hear every detail. Stay connected anywhere.", copy: "Explore wireless earphones, headphones and speakers backed by responsive support.", category: "Headphones", cta: "Shop audio", tone: "red" },
  { eyebrow: "Connected lifestyle", title: "Smarter essentials for every part of your day.", copy: "Wearables, charging and practical accessories with live stock and secure checkout.", category: "Smart Watches", cta: "Shop smart tech", tone: "violet" },
];

const serviceCards = [
  { icon: "▱", title: "Countrywide delivery", copy: "Reliable delivery support across Bangladesh." },
  { icon: "♢", title: "Official warranty", copy: "Clear warranty and after-sales assistance." },
  { icon: "↻", title: "Easy support", copy: "Responsive help before and after your order." },
  { icon: "▣", title: "Secure checkout", copy: "Prices and inventory are verified transactionally." },
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
  const [activeSlide, setActiveSlide] = useState(0);
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
    const timer = window.setInterval(() => setActiveSlide((value) => (value + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const newArrivals = useMemo(() => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6), [products]);
  const dealProducts = useMemo(() => {
    const discounted = products.filter((product) => product.compareAtCents && product.compareAtCents > product.priceCents);
    return (discounted.length ? discounted : products).slice(0, 6);
  }, [products]);
  const recommendations = useMemo(() => products.slice(0, 12), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map((product) => product.name.split(/\s+/)[0]).filter(Boolean))).slice(0, 8), [products]);
  const slide = slides[activeSlide];
  const heroProduct = products[activeSlide % Math.max(products.length, 1)];

  return (
    <div className="store-shell marketplace-storefront">
      <StoreHeader adminUrl={adminUrl} />
      <main className="marketplace-main">
        <section className="marketplace-hero-grid">
          <aside className="department-rail" aria-label="Shop departments">
            <div className="department-rail-title"><span>▦</span><strong>Shop departments</strong></div>
            {categories.map((category) => <Link key={category.name} href={`/categories?category=${encodeURIComponent(category.name)}`}><span>{category.icon}</span><div><strong>{category.name}</strong><small>{category.description}</small></div><i>›</i></Link>)}
            <Link className="department-view-all" href="/categories">View all products <span>→</span></Link>
          </aside>

          <section className={`marketplace-hero-carousel tone-${slide.tone}`} aria-roledescription="carousel" aria-label="Featured store promotions">
            <div className="marketplace-hero-copy">
              <p>{slide.eyebrow}</p>
              <h1>{slide.title}</h1>
              <span>{slide.copy}</span>
              <div><Link className="marketplace-primary-button" href={`/categories?category=${encodeURIComponent(slide.category)}`}>{slide.cta}</Link><Link className="marketplace-secondary-button" href="/categories?sort=discount">View deals</Link></div>
              <small className={`catalog-live${live ? " connected" : ""}`}>{live ? "Live catalog connected" : "Connecting live inventory"}</small>
            </div>
            <div className="marketplace-hero-art" aria-label={heroProduct ? `Featured product ${heroProduct.name}` : "Featured electronics"}>
              <div className="hero-product-orbit" />
              <div className="hero-product-device"><span>BJ</span><i /><b /></div>
              <div className="hero-product-caption"><small>Featured today</small><strong>{heroProduct?.name ?? "Premium technology collection"}</strong>{heroProduct ? <Link href={`/products/${heroProduct.slug}`}>View product →</Link> : <Link href="/categories">Browse products →</Link>}</div>
            </div>
            <div className="marketplace-carousel-controls" aria-label="Choose featured promotion">{slides.map((item, index) => <button key={item.title} className={index === activeSlide ? "active" : ""} type="button" onClick={() => setActiveSlide(index)} aria-label={`Show promotion ${index + 1}`} />)}</div>
          </section>

          <aside className="marketplace-side-promos">
            <article className="side-promo-card side-promo-deal"><span>Limited offers</span><h2>Save on selected essentials.</h2><p>Compare current discounts and available inventory.</p><Link href="/categories?sort=discount">Shop deals →</Link><div className="promo-disc">%</div></article>
            <article className="side-promo-card side-promo-business"><span>Business orders</span><h2>Technology for teams.</h2><p>Request product guidance and volume support.</p><a href="mailto:sales@bjelectronics.shop?subject=Business%20sales">Talk to sales →</a><div className="promo-stack"><i /><i /><i /></div></article>
          </aside>
        </section>

        <section className="marketplace-benefits" aria-label="Store benefits">
          {serviceCards.map((service) => <article key={service.title}><span>{service.icon}</span><div><strong>{service.title}</strong><small>{service.copy}</small></div></article>)}
        </section>

        <section className="marketplace-section marketplace-category-section">
          <header className="marketplace-section-heading"><div><span>Find products faster</span><h2>Shop by category</h2></div><Link href="/categories">Browse all categories →</Link></header>
          <div className="marketplace-category-grid">{categories.map((category) => <Link href={`/categories?category=${encodeURIComponent(category.name)}`} key={category.name}><span>{category.icon}</span><strong>{category.name}</strong><small>{category.description}</small></Link>)}</div>
        </section>

        <section className="marketplace-section deal-marketplace-section">
          <header className="marketplace-section-heading deal-heading"><div><span>Selected offers</span><h2>Today’s featured deals</h2></div><DealCountdown /><Link href="/categories?sort=discount">View all deals →</Link></header>
          {dealProducts.length ? <div className="marketplace-product-row">{dealProducts.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Featured offers will appear when products are published.</div>}
        </section>

        <section className="marketplace-campaign-grid">
          <article className="campaign-card campaign-computing"><div><span>Upgrade your setup</span><h2>Computing made simple.</h2><p>Performance-focused laptops, monitors and accessories for work and study.</p><Link href="/categories?category=Laptops">Shop computing</Link></div><div className="campaign-laptop"><span>BJ</span><i /></div></article>
          <article className="campaign-card campaign-audio"><div><span>Sound for every moment</span><h2>Wireless audio collection.</h2><p>Portable and personal audio for calls, music and entertainment.</p><Link href="/categories?category=Headphones">Shop audio</Link></div><div className="campaign-headset"><i /><b /><span /></div></article>
        </section>

        <section className="marketplace-section">
          <header className="marketplace-section-heading"><div><span>Recently published</span><h2>New arrivals</h2></div><Link href="/categories?sort=newest">See all new products →</Link></header>
          {newArrivals.length ? <div className="marketplace-product-row">{newArrivals.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">New products will appear as soon as the catalog is published.</div>}
        </section>

        <section className="marketplace-section brand-marketplace-section">
          <header className="marketplace-section-heading"><div><span>Popular names</span><h2>Shop featured brands</h2></div><Link href="/categories">Explore the catalog →</Link></header>
          <div className="brand-marketplace-grid">{(brands.length ? brands : ["Apple", "Samsung", "Sony", "JBL", "Anker", "Dell", "HP", "Lenovo"]).map((brand, index) => <Link key={brand} href={`/categories?q=${encodeURIComponent(brand)}`}><span className={`brand-symbol brand-symbol-${(index % 4) + 1}`}>{brand.slice(0, 2).toUpperCase()}</span><strong>{brand}</strong><small>Shop products</small></Link>)}</div>
        </section>

        <section className="marketplace-section recommendation-section">
          <header className="marketplace-section-heading"><div><span>Curated for everyday needs</span><h2>Recommended for you</h2></div><Link href="/categories">View complete catalog →</Link></header>
          {recommendations.length ? <div className="marketplace-recommendation-grid">{recommendations.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Recommended products will appear when inventory is available.</div>}
        </section>

        <section className="marketplace-business-banner">
          <div><span>Business purchasing</span><h2>Equip your team with dependable technology.</h2><p>Get product guidance, coordinated orders and responsive support for business requirements.</p><div><a className="marketplace-primary-button" href="mailto:sales@bjelectronics.shop?subject=Business%20purchase%20request">Request a quotation</a><a className="marketplace-secondary-button" href="mailto:support@bjelectronics.shop">Contact support</a></div></div>
          <aside><div><strong>Product guidance</strong><small>Help selecting the right equipment.</small></div><div><strong>Coordinated fulfilment</strong><small>Clear communication for larger orders.</small></div><div><strong>After-sales support</strong><small>Responsive assistance after delivery.</small></div></aside>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
