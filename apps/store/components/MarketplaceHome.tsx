"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Product } from "@bje/database";
import { ProductArtwork } from "@/components/ProductArtwork";
import { ProductCard } from "@/components/ProductCard";

const categoryCards = [
  { name: "Laptops", icon: "▰", detail: "Work, study and creativity" },
  { name: "Earphones", icon: "◖", detail: "Compact wireless sound" },
  { name: "Headphones", icon: "◉", detail: "Immersive listening" },
  { name: "Smart Watches", icon: "▣", detail: "Connected everyday wellness" },
  { name: "Speakers", icon: "◼", detail: "Portable and home audio" },
  { name: "Accessories", icon: "⌁", detail: "Charging, protection and more" },
  { name: "Monitors", icon: "▤", detail: "Clear productive displays" },
  { name: "Power Banks", icon: "▥", detail: "Reliable power on the move" },
];

const knownBrands = ["Apple", "Samsung", "Sony", "JBL", "Anker", "Dell", "Lenovo", "HP", "Asus", "Acer", "Xiaomi", "Logitech"];

function money(product: Product): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.priceCents / 100);
}

function discountPercent(product: Product): number {
  if (!product.compareAtCents || product.compareAtCents <= product.priceCents) return 0;
  return Math.round(((product.compareAtCents - product.priceCents) / product.compareAtCents) * 100);
}

export function MarketplaceHome({ products, live }: { products: Product[]; live: boolean }) {
  const discounted = useMemo(
    () => products.filter((product) => discountPercent(product) > 0).slice(0, 5),
    [products],
  );
  const latest = useMemo(
    () => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [products],
  );
  const available = useMemo(
    () => [...products].sort((a, b) => b.inventoryQuantity - a.inventoryQuantity).slice(0, 10),
    [products],
  );
  const detectedBrands = useMemo(
    () => knownBrands.filter((brand) => products.some((product) => product.name.toLowerCase().includes(brand.toLowerCase()))).slice(0, 8),
    [products],
  );

  const heroProduct = discounted[0] ?? products[0];
  const sideProducts = products.filter((product) => product.id !== heroProduct?.id).slice(0, 2);
  const dealProducts = discounted.length ? discounted : available.slice(0, 5);
  const brandItems = detectedBrands.length ? detectedBrands : ["Computing", "Mobile", "Audio", "Wearables", "Displays", "Power"];

  return (
    <>
      <section className="marketplace-hero" aria-labelledby="marketplace-title">
        <article className="marketplace-hero-main">
          <div className="marketplace-hero-copy">
            <span className="marketplace-kicker">BJ Electronics marketplace</span>
            <h1 id="marketplace-title">Everything you need for a smarter digital life.</h1>
            <p>Explore trusted technology through a fast marketplace experience backed by live stock, secure checkout and direct customer support.</p>
            <div className="marketplace-hero-actions">
              <Link className="marketplace-primary" href="/categories">Shop all products</Link>
              <Link className="marketplace-secondary" href="/categories?sort=discount">Explore current deals</Link>
            </div>
            <div className="marketplace-proof"><span>Live inventory</span><span>Protected cart</span><span>Responsive support</span></div>
          </div>
          <div className="marketplace-hero-product">
            {heroProduct ? <ProductArtwork product={heroProduct} /> : <span className="marketplace-placeholder">BJ</span>}
            <div className="marketplace-floating-price">
              <small>{heroProduct ? `${heroProduct.inventoryQuantity} in stock` : "Premium technology"}</small>
              <strong>{heroProduct ? money(heroProduct) : "Browse the catalog"}</strong>
              {heroProduct ? <Link href={`/products/${heroProduct.slug}`}>View product →</Link> : <Link href="/categories">Shop now →</Link>}
            </div>
          </div>
        </article>

        <div className="marketplace-hero-side">
          {sideProducts.map((product, index) => (
            <Link className={`marketplace-mini-banner banner-${index + 1}`} href={`/products/${product.slug}`} key={product.id}>
              <div><span>{index === 0 ? "Featured pick" : "Smart essential"}</span><strong>{product.name}</strong><small>{money(product)}</small></div>
              <ProductArtwork product={product} />
            </Link>
          ))}
          {!sideProducts.length ? (
            <Link className="marketplace-mini-banner banner-1" href="/categories"><div><span>Explore</span><strong>Technology for every day</strong><small>Browse categories</small></div><span className="marketplace-placeholder small">BJ</span></Link>
          ) : null}
        </div>
      </section>

      <section className="marketplace-assurance" aria-label="Marketplace benefits">
        <article><span>✦</span><div><strong>Authentic selection</strong><small>Catalog controlled by BJ Electronics</small></div></article>
        <article><span>▱</span><div><strong>Delivery support</strong><small>Availability confirmed at checkout</small></div></article>
        <article><span>↻</span><div><strong>Clear return help</strong><small>Direct assistance from customer care</small></div></article>
        <article><span>▣</span><div><strong>Secure checkout</strong><small>Inventory and pricing revalidated</small></div></article>
      </section>

      <section className="marketplace-section">
        <header className="marketplace-section-head"><div><span>Discover faster</span><h2>Shop popular categories</h2></div><Link href="/categories">View all categories</Link></header>
        <div className="marketplace-category-grid">
          {categoryCards.map((category) => (
            <Link href={`/categories?category=${encodeURIComponent(category.name)}`} key={category.name}>
              <span>{category.icon}</span><strong>{category.name}</strong><small>{category.detail}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="marketplace-section deal-zone">
        <header className="marketplace-section-head"><div><span>{discounted.length ? "Catalog-backed savings" : "Popular right now"}</span><h2>{discounted.length ? "Deal zone" : "Marketplace picks"}</h2></div><div className="marketplace-head-actions"><em className={live ? "is-live" : ""}>{live ? "Live catalog" : "Reconnecting"}</em><Link href="/categories?sort=discount">See all</Link></div></header>
        {dealProducts.length ? <div className="marketplace-product-row">{dealProducts.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Published products will appear here automatically.</div>}
      </section>

      <section className="marketplace-campaign-grid" aria-label="Featured campaigns">
        <Link className="marketplace-campaign campaign-computing" href="/categories?category=Laptops"><span>Performance collection</span><h2>Powerful computing for work and study.</h2><p>Find dependable laptops, monitors and essential accessories in one place.</p><strong>Shop computing →</strong></Link>
        <Link className="marketplace-campaign campaign-audio" href="/categories?category=Headphones"><span>Personal audio</span><h2>Hear every detail.</h2><p>Discover headphones, earphones and speakers built for everyday listening.</p><strong>Shop audio →</strong></Link>
        <Link className="marketplace-campaign campaign-power" href="/categories?category=Accessories"><span>Always connected</span><h2>Power and accessories.</h2><p>Keep devices protected, charged and ready wherever the day takes you.</p><strong>Shop essentials →</strong></Link>
      </section>

      <section className="marketplace-section brand-marketplace">
        <header className="marketplace-section-head"><div><span>Browse your way</span><h2>Popular brands & collections</h2></div><Link href="/categories">Explore catalog</Link></header>
        <div className="marketplace-brand-row">
          {brandItems.map((brand, index) => <Link href={`/categories?q=${encodeURIComponent(brand)}`} key={brand}><span>{String(index + 1).padStart(2, "0")}</span><strong>{brand}</strong></Link>)}
        </div>
      </section>

      <section className="marketplace-section">
        <header className="marketplace-section-head"><div><span>Recently published</span><h2>New arrivals</h2></div><Link href="/categories?sort=newest">View all</Link></header>
        {latest.length ? <div className="marketplace-product-row">{latest.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">New arrivals will appear after products are published.</div>}
      </section>

      <section className="marketplace-section marketplace-featured">
        <header className="marketplace-section-head"><div><span>Ready to ship</span><h2>Featured products</h2></div><Link href="/categories">Shop everything</Link></header>
        {available.length ? <div className="marketplace-featured-grid">{available.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">No products are currently available.</div>}
      </section>

      <section className="marketplace-support-panel">
        <div><span>Need help before ordering?</span><h2>Get product guidance from BJ Electronics.</h2><p>Use customer care for compatibility, availability, delivery and order questions.</p></div>
        <div><Link href="/track-order">Track an order</Link><a href="mailto:support@bjelectronics.shop">Contact support</a></div>
      </section>
    </>
  );
}
