"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@bje/database";
import { ProductCard } from "@/components/ProductCard";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

function readIds(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem("bje-wishlist") ?? "[]") as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function WishlistClient({ products, adminUrl }: { products: Product[]; adminUrl: string }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(readIds());
    sync();
    window.addEventListener("bje:wishlist", sync);
    return () => window.removeEventListener("bje:wishlist", sync);
  }, []);

  const saved = useMemo(() => products.filter((product) => ids.includes(product.id)), [ids, products]);

  return (
    <div className="store-shell wishlist-shell">
      <StoreHeader adminUrl={adminUrl} />
      <main className="wishlist-main">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span>›</span><strong>Wishlist</strong></nav>
        <div className="wishlist-heading"><div><span>Saved for later</span><h1>Your wishlist</h1><p>Keep products here while you compare specifications, pricing and availability.</p></div><Link className="shop-secondary" href="/shop">Continue shopping</Link></div>
        {saved.length ? <div className="listing-product-grid grid">{saved.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <section className="empty-cart"><span>♡</span><h1>Your wishlist is empty.</h1><p>Save products from the catalog to compare them later.</p><Link className="shop-primary" href="/shop">Browse products</Link></section>}
      </main>
      <StoreFooter />
    </div>
  );
}
