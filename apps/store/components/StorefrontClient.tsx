"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@bje/database";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { ProductCard } from "@/components/ProductCard";
import { CollectionSection } from "@/components/CollectionSection";
import { marketplaceBrands, marketplaceCategories } from "@/lib/marketplace";

const serviceHighlights = [
  ["🚚", "Countrywide delivery", "Reliable shipping across Bangladesh"],
  ["✓", "Official warranty", "Clear product coverage and support"],
  ["↻", "Easy return help", "Transparent post-purchase assistance"],
  ["▣", "Secure checkout", "Cash on delivery and bank transfer"],
];

function productText(product: Product): string { return `${product.name} ${product.sku} ${product.description}`.toLowerCase(); }
function selectCollection(products: Product[], keywords: string[], offset: number): Product[] {
  const matching = products.filter((product) => keywords.some((keyword) => productText(product).includes(keyword)));
  const fallback = [...products.slice(offset), ...products.slice(0, offset)];
  return [...matching, ...fallback.filter((product) => !matching.some((item) => item.id === product.id))].slice(0, 15);
}

export function StorefrontClient({ initialProducts, latestEventId, adminUrl }: { initialProducts: Product[]; latestEventId: number; adminUrl: string }) {
  const [products, setProducts] = useState(initialProducts);
  const [live, setLive] = useState(false);
  const cursor = useRef(latestEventId);

  useEffect(() => {
    const source = new EventSource(`/api/realtime?after=${cursor.current}`);
    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false);
    source.addEventListener("commerce", (event) => {
      try { const payload = JSON.parse((event as MessageEvent<string>).data) as { id?: number }; if (typeof payload.id === "number") cursor.current = payload.id; } catch { /* catalog refresh remains authoritative */ }
      void fetch("/api/catalog", { cache: "no-store" }).then((response) => response.json()).then((payload: { products?: Product[]; latestEventId?: number }) => {
        if (payload.products) setProducts(payload.products);
        if (typeof payload.latestEventId === "number") cursor.current = payload.latestEventId;
      }).catch(() => undefined);
    });
    return () => source.close();
  }, []);

  const newArrivals = useMemo(() => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6), [products]);
  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const deals = useMemo(() => products.filter((product) => product.compareAtCents && product.compareAtCents > product.priceCents).slice(0, 6), [products]);
  const topDemand = useMemo(() => [...products].sort((a, b) => ((b.compareAtCents ?? b.priceCents) - b.priceCents) - ((a.compareAtCents ?? a.priceCents) - a.priceCents) || b.inventoryQuantity - a.inventoryQuantity).slice(0, 15), [products]);
  const entertainment = useMemo(() => selectCollection(products, ["tv", "television", "display", "monitor"], 0), [products]);
  const appliances = useMemo(() => selectCollection(products, ["refrigerator", "washer", "air conditioner", "appliance", "kitchen"], 3), [products]);
  const computing = useMemo(() => selectCollection(products, ["laptop", "computer", "notebook", "macbook"], 6), [products]);
  const audio = useMemo(() => selectCollection(products, ["headphone", "earphone", "earbud", "speaker", "audio"], 9), [products]);
  const heroProduct = products[0];

  return <div className="store-shell caravan-storefront full-market-storefront">
    <StoreHeader adminUrl={adminUrl} />
    <main>
      <section className="caravan-hero-shell full-market-hero">
        <aside className="hero-departments" aria-label="Shop departments"><h2>Shop by department</h2>{marketplaceCategories.slice(0, 8).map((category) => <Link key={category.key} href={`/categories?category=${encodeURIComponent(category.label)}`}><span>{category.icon}</span><div><strong>{category.label}</strong><small>{category.description}</small></div><b>›</b></Link>)}<Link className="hero-view-all" href="/categories"><span>＋</span><div><strong>View all products</strong><small>Explore the complete marketplace</small></div><b>›</b></Link></aside>
        <section className="retail-hero caravan-main-hero" aria-labelledby="caravan-hero-title"><div className="caravan-hero-copy"><p className="hero-kicker">Electronics and appliances marketplace</p><h1 id="caravan-hero-title">Technology for every part of your home and day.</h1><p>Explore trusted televisions, appliances, mobile devices, computing, audio and accessories with live inventory and secure ordering.</p><div className="retail-hero-actions"><Link className="shop-primary" href="/categories">Shop all products</Link><Link className="shop-secondary" href="/categories?sort=discount">View special offers</Link></div><div className="hero-mini-proof"><span>✓ Live stock</span><span>✓ Secure checkout</span><span>✓ Nationwide support</span></div></div><div className="caravan-hero-product"><div className="hero-glow" /><div className="hero-laptop"><div className="hero-laptop-screen"><i /><i /><i /><span>BJ</span></div><div className="hero-laptop-base" /></div><div className="hero-product-label"><small>Featured today</small><strong>{heroProduct?.name ?? "Premium electronics collection"}</strong><Link href={heroProduct ? `/products/${heroProduct.slug}` : "/categories"}>View product →</Link></div></div></section>
        <aside className="hero-side-offers" aria-label="Featured store offers"><article className="hero-side-card side-card-blue"><span>Home entertainment</span><h2>Bring every screen to life.</h2><Link href="/categories?category=TV%20%26%20Entertainment">Shop televisions</Link></article><article className="hero-side-card side-card-red"><span>Home upgrade</span><h2>Smarter appliances, easier living.</h2><Link href="/categories?category=Home%20Appliances">Shop appliances</Link></article></aside>
      </section>
      <section className="retail-trust caravan-trust" aria-label="Shopping benefits">{serviceHighlights.map(([icon, title, copy]) => <article key={title}><span>{icon}</span><div><strong>{title}</strong><small>{copy}</small></div></article>)}</section>
      <section className="retail-section category-section"><div className="retail-section-heading"><div><span>Browse faster</span><h2>Popular departments</h2></div><Link href="/categories">View all departments</Link></div><div className="category-tile-grid caravan-category-grid full-category-grid">{marketplaceCategories.slice(0, 8).map((category) => <Link className="category-tile" href={`/categories?category=${encodeURIComponent(category.label)}`} key={category.key}><span className="category-tile-icon">{category.icon}</span><strong>{category.label}</strong><small>{category.description}</small></Link>)}</div></section>
      <CollectionSection eyebrow="Popular now" title="Top Demand" products={topDemand} viewAllHref="/categories?sort=discount" />
      <CollectionSection title="TV & Entertainment" products={entertainment} viewAllHref="/categories?category=TV%20%26%20Entertainment" />
      <CollectionSection title="Home Appliances" products={appliances} viewAllHref="/categories?category=Home%20Appliances" />
      <CollectionSection title="Laptops & Computing" products={computing} viewAllHref="/categories?category=Laptops%20%26%20Computing" />
      <CollectionSection title="Audio & Headphones" products={audio} viewAllHref="/categories?category=Audio" />
      <section className="retail-section caravan-products-section flash-market-section"><div className="retail-section-heading"><div><span className="flash-label">Flash sale</span><h2>Today&apos;s best offers</h2></div><div className="heading-actions"><span>Limited inventory</span><Link href="/categories?sort=discount">Shop all deals</Link></div></div>{(deals.length ? deals : featuredProducts.slice(0, 6)).length ? <div className="horizontal-product-grid caravan-product-grid">{(deals.length ? deals : featuredProducts.slice(0, 6)).map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Promotional products will appear here when discounts are active.</div>}</section>
      <section className="wide-campaign-banner appliance-campaign-banner"><div><span>Complete home technology</span><h2>Upgrade entertainment, comfort and everyday living.</h2><p>Shop televisions, cooling, laundry, kitchen and connected technology from one trusted marketplace.</p><Link href="/categories">Explore the complete catalog</Link></div><div className="campaign-device-art" aria-hidden="true"><i /><span /><b /></div></section>
      <section className="retail-section caravan-products-section"><div className="retail-section-heading"><div><span>Customer favourites</span><h2>Featured products</h2></div><div className="heading-actions"><span className={`catalog-live${live ? " connected" : ""}`}>{live ? "Live inventory" : "Connecting"}</span><Link href="/categories">View all</Link></div></div>{featuredProducts.length ? <div className="featured-product-grid caravan-product-grid">{featuredProducts.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Featured products will appear here.</div>}</section>
      <section className="split-campaigns"><article className="split-campaign campaign-computing"><span>Home appliances</span><h2>Reliable solutions for modern households.</h2><p>Discover cooling, laundry, cooking and everyday appliance essentials.</p><Link href="/categories?category=Home%20Appliances">Shop home appliances</Link></article><article className="split-campaign campaign-lifestyle"><span>Connected lifestyle</span><h2>Mobile, computing and audio for every day.</h2><p>Stay productive and entertained with dependable connected technology.</p><Link href="/categories?category=Laptops%20%26%20Computing">Shop connected technology</Link></article></section>
      <section className="retail-section caravan-products-section"><div className="retail-section-heading"><div><span>Recently added</span><h2>New arrivals</h2></div><Link href="/categories?sort=newest">View all new products</Link></div>{newArrivals.length ? <div className="horizontal-product-grid caravan-product-grid">{newArrivals.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">New products will appear here as soon as they are published.</div>}</section>
      <section className="brand-showcase"><div className="retail-section-heading"><div><span>Trusted names</span><h2>Shop leading brands</h2></div><Link href="/categories">Browse products</Link></div><div className="brand-logo-grid full-brand-grid">{marketplaceBrands.map((brand) => <Link href={`/categories?q=${encodeURIComponent(brand)}`} key={brand}>{brand}</Link>)}</div></section>
      <section className="store-confidence-section full-confidence-section"><article><span>01</span><h3>Curated catalog</h3><p>Products are controlled from the secure administration platform with live pricing and inventory.</p></article><article><span>02</span><h3>Transactional checkout</h3><p>Cart totals and stock are verified again before an order is accepted.</p></article><article><span>03</span><h3>Responsive assistance</h3><p>Support is available for product selection, delivery questions and after-sales service.</p></article><article><span>04</span><h3>Secure operations</h3><p>The administration application remains isolated from the public storefront.</p></article></section>
    </main><StoreFooter />
  </div>;
}
