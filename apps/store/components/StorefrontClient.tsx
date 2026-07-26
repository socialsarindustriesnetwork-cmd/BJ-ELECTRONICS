"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@bje/database";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { CaravanHero } from "@/components/CaravanHero";
import { CollectionSection } from "@/components/CollectionSection";

const categories = [
  { name: "Laptops", icon: "▰" },
  { name: "Headphones", icon: "◉" },
  { name: "Smart Watches", icon: "▣" },
  { name: "Accessories", icon: "⌁" },
  { name: "Power Banks", icon: "▥" },
];

function productText(product: Product): string {
  return `${product.name} ${product.sku} ${product.description}`.toLowerCase();
}

function collection(products: Product[], keywords: string[], fallbackOffset: number): Product[] {
  const matches = products.filter((product) => keywords.some((keyword) => productText(product).includes(keyword)));
  if (matches.length >= 3) return matches;
  const fallback = [...products.slice(fallbackOffset), ...products.slice(0, fallbackOffset)];
  return [...matches, ...fallback.filter((product) => !matches.some((item) => item.id === product.id))].slice(0, 12);
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
        // The catalog request below remains authoritative when an event payload is malformed.
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

  const topDemand = useMemo(() => [...products].sort((a, b) => {
    const aDiscount = (a.compareAtCents ?? a.priceCents) - a.priceCents;
    const bDiscount = (b.compareAtCents ?? b.priceCents) - b.priceCents;
    return bDiscount - aDiscount || b.inventoryQuantity - a.inventoryQuantity;
  }), [products]);
  const laptops = useMemo(() => collection(products, ["laptop", "notebook", "macbook", "chromebook"], 0), [products]);
  const audio = useMemo(() => collection(products, ["headphone", "earphone", "earbud", "speaker", "audio"], 3), [products]);
  const smartLiving = useMemo(() => collection(products, ["watch", "smart", "monitor", "wearable"], 6), [products]);
  const powerAccessories = useMemo(() => collection(products, ["power", "charger", "cable", "adapter", "accessor"], 9), [products]);

  return (
    <div className="store-shell caravan-store">
      <StoreHeader adminUrl={adminUrl} />
      <main>
        <CaravanHero featuredProduct={products[0]} />

        <section className="caravan-category-strip" aria-label="Featured categories">
          {categories.map((category) => (
            <Link href={`/categories?category=${encodeURIComponent(category.name)}`} key={category.name}>
              <span>{category.icon}</span>
              <strong>{category.name}</strong>
            </Link>
          ))}
        </section>

        <div className="caravan-live-bar">
          <span className={live ? "connected" : ""}>{live ? "● Live catalog connected" : "○ Connecting live catalog"}</span>
          <Link href="/shop">Browse the complete shop →</Link>
        </div>

        <CollectionSection eyebrow="Popular now" title="Top Demand" products={topDemand} viewAllHref="/categories?sort=discount" />
        <CollectionSection title="Laptops" products={laptops} viewAllHref="/categories?category=Laptops" />
        <CollectionSection title="Audio & Headphones" products={audio} viewAllHref="/categories?category=Headphones" />
        <CollectionSection title="Smart Living" products={smartLiving} viewAllHref="/categories?category=Smart%20Watches" />
        <CollectionSection title="Power & Accessories" products={powerAccessories} viewAllHref="/categories?category=Accessories" />

        <section className="caravan-service-band" aria-label="BJ Electronics service promises">
          <article><span>✓</span><div><strong>Verified products</strong><small>Published from the controlled BJ Electronics catalog.</small></div></article>
          <article><span>↻</span><div><strong>Live stock updates</strong><small>Inventory changes appear without a storefront redeploy.</small></div></article>
          <article><span>▣</span><div><strong>Protected checkout</strong><small>Prices and inventory are checked when the order is placed.</small></div></article>
          <article><span>✉</span><div><strong>Responsive support</strong><small>Contact the store team before or after purchase.</small></div></article>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}