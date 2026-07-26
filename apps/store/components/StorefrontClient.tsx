"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@bje/database";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { ProductCard } from "@/components/ProductCard";

type CategoryDefinition = {
  name: string;
  icon: string;
  description: string;
  keywords: string[];
};

const categories: CategoryDefinition[] = [
  { name: "Laptops", icon: "▰", description: "Powerful mobile computing", keywords: ["laptop", "macbook", "notebook", "thinkpad", "zenbook"] },
  { name: "Earphones", icon: "◖", description: "Compact wireless audio", keywords: ["earphone", "airpods", "earbud", "buds"] },
  { name: "Headphones", icon: "◉", description: "Immersive personal sound", keywords: ["headphone", "quietcomfort", "wh-"] },
  { name: "Smart Watches", icon: "▣", description: "Connected daily wellness", keywords: ["watch", "wearable"] },
  { name: "Speakers", icon: "◼", description: "Room-filling entertainment", keywords: ["speaker", "soundbar", "charge"] },
  { name: "Accessories", icon: "⌁", description: "Cables, chargers and more", keywords: ["accessory", "charger", "cable", "powercore", "adapter"] },
  { name: "Monitors", icon: "▤", description: "Clear productive displays", keywords: ["monitor", "display"] },
  { name: "Power Banks", icon: "▥", description: "Power wherever you go", keywords: ["power bank", "powerbank", "battery"] },
];

const storeBrands = ["Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo", "JBL", "Anker"];

function productText(product: Product): string {
  return `${product.name} ${product.sku} ${product.description}`.toLowerCase();
}

function productsForCategory(products: Product[], category: CategoryDefinition, offset: number): Product[] {
  const matches = products.filter((product) => category.keywords.some((keyword) => productText(product).includes(keyword)));
  const matchIds = new Set(matches.map((product) => product.id));
  const fallback = products.filter((product) => !matchIds.has(product.id));
  const rotated = fallback.length ? [...fallback.slice(offset % fallback.length), ...fallback.slice(0, offset % fallback.length)] : [];
  return [...matches, ...rotated].slice(0, 5);
}

function ProductShelf({
  title,
  eyebrow,
  products,
  href,
}: {
  title: string;
  eyebrow: string;
  products: Product[];
  href: string;
}) {
  return (
    <section className="reference-product-shelf retail-section">
      <div className="retail-section-heading">
        <div><span>{eyebrow}</span><h2>{title}</h2></div>
        <Link href={href}>View all</Link>
      </div>
      {products.length ? (
        <div className="horizontal-product-grid reference-shelf-grid">
          {products.map((product) => <ProductCard compact product={product} key={product.id} />)}
        </div>
      ) : (
        <div className="empty-state">Products will appear here when they are published from the administration portal.</div>
      )}
    </section>
  );
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

  const newest = useMemo(() => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5), [products]);
  const deals = useMemo(() => {
    const discounted = products.filter((product) => product.compareAtCents && product.compareAtCents > product.priceCents);
    return [...discounted, ...products.filter((product) => !discounted.some((deal) => deal.id === product.id))].slice(0, 5);
  }, [products]);
  const categoryShelves = useMemo(
    () => categories.slice(0, 4).map((category, index) => ({ category, products: productsForCategory(products, category, index * 3) })),
    [products],
  );
  const heroProduct = products[0];
  const secondaryProduct = products[1];

  return (
    <div className="store-shell reference-storefront caravan-reference-storefront">
      <StoreHeader adminUrl={adminUrl} />
      <main>
        <section className="reference-commerce-stage" aria-labelledby="hero-title">
          <aside className="reference-category-menu" aria-label="Featured categories">
            <div className="reference-category-title"><span>☰</span><strong>Shop categories</strong></div>
            {categories.map((category) => (
              <Link href={`/categories?category=${encodeURIComponent(category.name)}`} key={category.name}>
                <span className="reference-category-icon">{category.icon}</span>
                <span><strong>{category.name}</strong><small>{category.description}</small></span>
                <b>›</b>
              </Link>
            ))}
          </aside>

          <section className="reference-main-banner retail-hero">
            <div className="reference-banner-copy">
              <p className="hero-kicker">BJ Electronics official online store</p>
              <h1 id="hero-title">Quality technology.<br /><span>Trusted shopping.</span></h1>
              <p>Shop dependable laptops, audio, wearables and accessories with live inventory, secure checkout and professional after-sales support.</p>
              <div className="retail-hero-actions">
                <Link className="shop-primary" href="/categories">Explore products</Link>
                <Link className="shop-secondary" href={heroProduct ? `/products/${heroProduct.slug}` : "/categories"}>View featured item</Link>
              </div>
              <div className="reference-live-pill"><i className={live ? "online" : ""} />{live ? "Catalog connected" : "Connecting live catalog"}</div>
            </div>
            <div className="reference-banner-device" aria-label={heroProduct ? `Featured product ${heroProduct.name}` : "Featured electronics collection"}>
              <div className="reference-device-screen"><span>BJ</span><i /><i /><i /></div>
              <div className="reference-device-base" />
              <div className="reference-featured-label"><small>Featured</small><strong>{heroProduct?.name ?? "Premium technology collection"}</strong></div>
            </div>
          </section>

          <div className="reference-side-offers">
            <Link className="reference-mini-offer offer-blue" href="/categories?sort=discount">
              <span>Special offers</span><strong>Smart savings on selected products</strong><small>View current deals →</small>
            </Link>
            <Link className="reference-mini-offer offer-red" href={secondaryProduct ? `/products/${secondaryProduct.slug}` : "/categories?sort=newest"}>
              <span>New arrival</span><strong>{secondaryProduct?.name ?? "Latest technology, ready to explore"}</strong><small>Shop the collection →</small>
            </Link>
          </div>
        </section>

        <section className="reference-benefit-strip" aria-label="Shopping benefits">
          <article><span>🚚</span><div><strong>Nationwide delivery</strong><small>Reliable order fulfilment</small></div></article>
          <article><span>♢</span><div><strong>Official warranty</strong><small>Clear product coverage</small></div></article>
          <article><span>↻</span><div><strong>Return assistance</strong><small>Professional support process</small></div></article>
          <article><span>▣</span><div><strong>Secure checkout</strong><small>Protected cart and ordering</small></div></article>
        </section>

        <section className="retail-section reference-featured-categories">
          <div className="retail-section-heading"><div><span>Browse faster</span><h2>Shop by category</h2></div><Link href="/categories">All categories</Link></div>
          <div className="reference-category-card-grid">
            {categories.map((category) => (
              <Link href={`/categories?category=${encodeURIComponent(category.name)}`} key={category.name}>
                <span>{category.icon}</span><strong>{category.name}</strong><small>{category.description}</small>
              </Link>
            ))}
          </div>
        </section>

        <ProductShelf title="Featured products" eyebrow="Limited-time value" products={deals} href="/categories?sort=discount" />
        <ProductShelf title="New arrivals" eyebrow="Fresh technology" products={newest} href="/categories?sort=newest" />

        {categoryShelves.map(({ category, products: shelfProducts }) => (
          <ProductShelf
            key={category.name}
            title={category.name}
            eyebrow={`Recommended ${category.name.toLowerCase()}`}
            products={shelfProducts}
            href={`/categories?category=${encodeURIComponent(category.name)}`}
          />
        ))}

        <section className="reference-brand-strip retail-section" aria-label="Popular brands">
          <div className="retail-section-heading"><div><span>Trusted names</span><h2>Shop popular brands</h2></div><Link href="/categories">Browse products</Link></div>
          <div className="reference-brand-grid">{storeBrands.map((brand) => <span key={brand}>{brand}</span>)}</div>
        </section>

        <section className="reference-quality-promise">
          <div>
            <span className="promise-badge">BJ</span>
            <div><p className="hero-kicker">Quality, trust and customer care</p><h2>Technology selected for a better everyday life.</h2><p>Every published product is managed through one operational catalog, with inventory revalidated before order confirmation and support available throughout the buying journey.</p></div>
          </div>
          <ul><li>✓ Controlled product catalog</li><li>✓ Live inventory updates</li><li>✓ Secure transactional ordering</li><li>✓ Dedicated customer support</li></ul>
        </section>

        <section className="reference-order-support">
          <div><span>Need help choosing?</span><h2>Talk with BJ Electronics before you order.</h2><p>Send your requirements, preferred model and budget. Our support team will help you find the right option from the live catalog.</p></div>
          <div className="reference-support-actions"><a className="shop-primary" href="mailto:support@bjelectronics.shop?subject=Product%20selection%20support">Email product support</a><Link className="shop-secondary" href="/categories">Continue shopping</Link></div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
