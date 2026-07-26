"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@bje/database";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { ProductCard } from "@/components/ProductCard";
import { CollectionSection } from "@/components/CollectionSection";

const categories = [
  { name: "Laptops", icon: "▰", description: "Work, study and performance" },
  { name: "Earphones", icon: "◖", description: "Compact wireless audio" },
  { name: "Headphones", icon: "◉", description: "Immersive listening" },
  { name: "Smart Watches", icon: "▣", description: "Connected wellness" },
  { name: "Speakers", icon: "◼", description: "Portable and home audio" },
  { name: "Accessories", icon: "⌁", description: "Cables, chargers and more" },
  { name: "Monitors", icon: "▤", description: "Productive clear displays" },
  { name: "Power Banks", icon: "▥", description: "Reliable mobile power" },
];

const serviceHighlights = [
  ["🚚", "Countrywide delivery", "Reliable shipping across Bangladesh"],
  ["✓", "Official warranty", "Clear product coverage and support"],
  ["↻", "Easy return help", "Transparent post-purchase assistance"],
  ["▣", "Secure checkout", "Protected cart and order processing"],
];

const brands = ["Apple", "Samsung", "Dell", "HP", "Lenovo", "Sony", "JBL", "Anker"];

function productText(product: Product): string {
  return `${product.name} ${product.sku} ${product.description}`.toLowerCase();
}

function selectCollection(products: Product[], keywords: string[], fallbackOffset: number): Product[] {
  const matching = products.filter((product) => keywords.some((keyword) => productText(product).includes(keyword)));
  const fallback = [...products.slice(fallbackOffset), ...products.slice(0, fallbackOffset)];
  return [...matching, ...fallback.filter((product) => !matching.some((item) => item.id === product.id))].slice(0, 15);
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
        // Catalog refresh below remains authoritative.
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

  const newArrivals = useMemo(() => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6), [products]);
  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const deals = useMemo(() => products.filter((product) => product.compareAtCents && product.compareAtCents > product.priceCents).slice(0, 6), [products]);
  const topDemand = useMemo(() => [...products].sort((a, b) => {
    const aDiscount = (a.compareAtCents ?? a.priceCents) - a.priceCents;
    const bDiscount = (b.compareAtCents ?? b.priceCents) - b.priceCents;
    return bDiscount - aDiscount || b.inventoryQuantity - a.inventoryQuantity;
  }).slice(0, 15), [products]);
  const laptopCollection = useMemo(() => selectCollection(products, ["laptop", "notebook", "macbook", "chromebook"], 0), [products]);
  const audioCollection = useMemo(() => selectCollection(products, ["headphone", "earphone", "earbud", "speaker", "audio"], 3), [products]);
  const smartCollection = useMemo(() => selectCollection(products, ["watch", "smart", "wearable", "monitor"], 6), [products]);
  const powerCollection = useMemo(() => selectCollection(products, ["power", "charger", "cable", "adapter", "accessor"], 9), [products]);
  const heroProduct = products[0];

  return (
    <div className="store-shell caravan-storefront">
      <StoreHeader adminUrl={adminUrl} />
      <main>
        <section className="caravan-hero-shell">
          <aside className="hero-departments" aria-label="Shop departments">
            <h2>Shop by category</h2>
            {categories.map((category) => (
              <Link key={category.name} href={`/categories?category=${encodeURIComponent(category.name)}`}>
                <span>{category.icon}</span>
                <div><strong>{category.name}</strong><small>{category.description}</small></div>
                <b>›</b>
              </Link>
            ))}
          </aside>

          <section className="retail-hero caravan-main-hero" aria-labelledby="caravan-hero-title">
            <div className="caravan-hero-copy">
              <p className="hero-kicker">Original products. Dependable service.</p>
              <h1 id="caravan-hero-title">Technology for every part of your day.</h1>
              <p>Explore trusted electronics, live inventory, secure ordering and responsive support—all in one modern BJ Electronics storefront.</p>
              <div className="retail-hero-actions">
                <Link className="shop-primary" href="/categories">Shop all products</Link>
                <Link className="shop-secondary" href="/categories?sort=discount">View special offers</Link>
              </div>
              <div className="hero-mini-proof"><span>✓ Live stock</span><span>✓ Secure checkout</span><span>✓ Fast support</span></div>
            </div>
            <div className="caravan-hero-product">
              <div className="hero-glow" />
              <div className="hero-laptop"><div className="hero-laptop-screen"><i /><i /><i /><span>BJ</span></div><div className="hero-laptop-base" /></div>
              <div className="hero-product-label"><small>Featured technology</small><strong>{heroProduct?.name ?? "Premium electronics collection"}</strong><Link href={heroProduct ? `/products/${heroProduct.slug}` : "/categories"}>View product →</Link></div>
            </div>
          </section>

          <aside className="hero-side-offers" aria-label="Featured store offers">
            <article className="hero-side-card side-card-blue"><span>Audio collection</span><h2>Clear sound, anywhere.</h2><Link href="/categories?category=Headphones">Shop audio</Link></article>
            <article className="hero-side-card side-card-red"><span>Mobile essentials</span><h2>Power your day.</h2><Link href="/categories?category=Power%20Banks">Shop power</Link></article>
          </aside>
        </section>

        <section className="retail-trust caravan-trust" aria-label="Shopping benefits">
          {serviceHighlights.map(([icon, title, copy]) => <article key={title}><span>{icon}</span><div><strong>{title}</strong><small>{copy}</small></div></article>)}
        </section>

        <section className="retail-section category-section">
          <div className="retail-section-heading"><div><span>Browse faster</span><h2>Popular categories</h2></div><Link href="/categories">View all categories</Link></div>
          <div className="category-tile-grid caravan-category-grid">
            {categories.map((category) => (
              <Link className="category-tile" href={`/categories?category=${encodeURIComponent(category.name)}`} key={category.name}>
                <span className="category-tile-icon">{category.icon}</span><strong>{category.name}</strong><small>{category.description}</small>
              </Link>
            ))}
          </div>
        </section>

        <CollectionSection eyebrow="Popular now" title="Top Demand" products={topDemand} viewAllHref="/categories?sort=discount" />
        <CollectionSection title="Laptops" products={laptopCollection} viewAllHref="/categories?category=Laptops" />
        <CollectionSection title="Audio & Headphones" products={audioCollection} viewAllHref="/categories?category=Headphones" />
        <CollectionSection title="Smart Watches & Displays" products={smartCollection} viewAllHref="/categories?category=Smart%20Watches" />
        <CollectionSection title="Power & Accessories" products={powerCollection} viewAllHref="/categories?category=Accessories" />

        <section className="retail-section caravan-products-section">
          <div className="retail-section-heading"><div><span>Recently added</span><h2>New arrivals</h2></div><div className="heading-actions"><span className={`catalog-live${live ? " connected" : ""}`}>{live ? "Live inventory" : "Connecting"}</span><Link href="/categories?sort=newest">View all</Link></div></div>
          {newArrivals.length ? <div className="horizontal-product-grid caravan-product-grid">{newArrivals.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">New products will appear here as soon as they are published.</div>}
        </section>

        <section className="wide-campaign-banner">
          <div><span>Performance week</span><h2>Build your complete setup.</h2><p>Pair laptops, monitors, audio and accessories from one trusted store.</p><Link href="/categories">Explore the collection</Link></div>
          <div className="campaign-device-art" aria-hidden="true"><i /><span /><b /></div>
        </section>

        <section className="retail-section caravan-products-section">
          <div className="retail-section-heading"><div><span>Customer favourites</span><h2>Featured products</h2></div><Link href="/categories?sort=popular">View all</Link></div>
          {featuredProducts.length ? <div className="featured-product-grid caravan-product-grid">{featuredProducts.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Featured products will appear here.</div>}
        </section>

        <section className="split-campaigns">
          <article className="split-campaign campaign-computing"><span>Computing essentials</span><h2>Work smarter with a complete setup.</h2><p>Discover laptops, monitors and accessories selected for productivity.</p><Link href="/categories?category=Laptops">Shop computing</Link></article>
          <article className="split-campaign campaign-lifestyle"><span>Connected lifestyle</span><h2>Audio and wearables for every day.</h2><p>Stay connected with dependable sound, smart watches and mobile power.</p><Link href="/categories?category=Smart%20Watches">Shop lifestyle tech</Link></article>
        </section>

        <section className="retail-section caravan-products-section">
          <div className="retail-section-heading"><div><span>Limited-time value</span><h2>Special offers</h2></div><Link href="/categories?sort=discount">Shop all deals</Link></div>
          {deals.length ? <div className="horizontal-product-grid caravan-product-grid">{deals.map((product) => <ProductCard compact product={product} key={product.id} />)}</div> : <div className="empty-state">Current promotional products will appear here when discounts are active.</div>}
        </section>

        <section className="brand-showcase">
          <div className="retail-section-heading"><div><span>Trusted names</span><h2>Shop leading brands</h2></div><Link href="/categories">Browse products</Link></div>
          <div className="brand-logo-grid">{brands.map((brand) => <Link href={`/categories?q=${encodeURIComponent(brand)}`} key={brand}>{brand}</Link>)}</div>
        </section>

        <section className="store-confidence-section">
          <article><span>01</span><h3>Curated catalog</h3><p>Products are controlled from the secure administration platform with live pricing and inventory.</p></article>
          <article><span>02</span><h3>Transactional checkout</h3><p>Cart totals and stock are verified again before an order is accepted.</p></article>
          <article><span>03</span><h3>Responsive assistance</h3><p>Support is available for product selection, delivery questions and after-sales service.</p></article>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
