"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@bje/database";
import type { CommerceCart } from "@bje/database/transactions";
import { ProductArtwork } from "@/components/ProductArtwork";
import { marketplaceCategoryLabel, productBrand } from "@/lib/marketplace";

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency }).format(cents / 100);
}

function readWishlist(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem("bje-wishlist") ?? "[]") as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => setSaved(readWishlist().includes(product.id)), [product.id]);

  async function addToCart() {
    setAdding(true);
    setMessage("");
    try {
      const cartResponse = await fetch("/api/cart", { cache: "no-store" });
      const current = await cartResponse.json() as { cart?: CommerceCart };
      const quantity = (current.cart?.lines.find((line) => line.productId === product.id)?.quantity ?? 0) + 1;
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      const payload = await response.json() as { cart?: CommerceCart; error?: string };
      if (!response.ok || !payload.cart) throw new Error(payload.error || "Could not add this product.");
      window.dispatchEvent(new CustomEvent("bje:cart", { detail: payload.cart.itemCount }));
      setMessage("Added");
      window.setTimeout(() => setMessage(""), 1600);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add this product.");
    } finally {
      setAdding(false);
    }
  }

  function toggleWishlist() {
    const current = readWishlist();
    const next = current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id];
    localStorage.setItem("bje-wishlist", JSON.stringify(next));
    setSaved(next.includes(product.id));
    window.dispatchEvent(new Event("bje:wishlist"));
  }

  const brand = productBrand(product);
  const category = marketplaceCategoryLabel(product);
  const discount = product.compareAtCents && product.compareAtCents > product.priceCents
    ? Math.round((1 - product.priceCents / product.compareAtCents) * 100)
    : 0;

  return (
    <article className={`catalog-card marketplace-catalog-card${compact ? " compact" : ""}`}>
      <div className="catalog-card-media">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><ProductArtwork product={product} /></Link>
        <button className={`wishlist-toggle${saved ? " saved" : ""}`} type="button" onClick={toggleWishlist} aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}>{saved ? "♥" : "♡"}</button>
        {discount > 0 ? <span className="sale-badge">-{discount}%</span> : <span className="new-badge">New</span>}
        <span className={`card-stock-indicator${product.inventoryQuantity > 0 ? " available" : " unavailable"}`}>{product.inventoryQuantity > 0 ? "In stock" : "Out of stock"}</span>
      </div>
      <div className="catalog-card-body">
        <span className="catalog-category">{category}</span>
        <span className="catalog-sku">{brand} · {product.sku}</span>
        <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
        {!compact ? <p>{product.description}</p> : null}
        <div className="rating-row" aria-label="Rated 4.8 out of 5"><span>★★★★★</span><small>4.8 (128)</small></div>
        <div className="catalog-card-footer">
          <div className="catalog-price"><strong>{money(product.priceCents, product.currency)}</strong>{product.compareAtCents ? <del>{money(product.compareAtCents, product.currency)}</del> : null}</div>
          <button className="catalog-add" type="button" onClick={addToCart} disabled={adding || product.inventoryQuantity < 1}>{product.inventoryQuantity < 1 ? "Unavailable" : adding ? "Adding…" : message || "Add to cart"}</button>
        </div>
      </div>
    </article>
  );
}
