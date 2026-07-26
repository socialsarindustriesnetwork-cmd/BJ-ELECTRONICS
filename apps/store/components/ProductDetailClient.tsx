"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@bje/database";
import type { CommerceCart } from "@bje/database/transactions";
import { ProductArtwork } from "@/components/ProductArtwork";
import { ProductCard } from "@/components/ProductCard";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function wishlistIds(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem("bje-wishlist") ?? "[]") as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function ProductDetailClient({ product, similar, adminUrl }: { product: Product; similar: Product[]; adminUrl: string }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => setSaved(wishlistIds().includes(product.id)), [product.id]);

  async function addToCart() {
    setAdding(true);
    setMessage("");
    try {
      const currentResponse = await fetch("/api/cart", { cache: "no-store" });
      const currentPayload = await currentResponse.json() as { cart?: CommerceCart };
      const currentQuantity = currentPayload.cart?.lines.find((line) => line.productId === product.id)?.quantity ?? 0;
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: currentQuantity + quantity }),
      });
      const payload = await response.json() as { cart?: CommerceCart; error?: string };
      if (!response.ok || !payload.cart) throw new Error(payload.error || "Could not add this product.");
      window.dispatchEvent(new CustomEvent("bje:cart", { detail: payload.cart.itemCount }));
      setMessage(`${quantity} item${quantity === 1 ? "" : "s"} added to your cart.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add this product.");
    } finally {
      setAdding(false);
    }
  }

  function toggleWishlist() {
    const current = wishlistIds();
    const next = current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id];
    localStorage.setItem("bje-wishlist", JSON.stringify(next));
    setSaved(next.includes(product.id));
    window.dispatchEvent(new Event("bje:wishlist"));
  }

  const features = [
    product.description,
    `${product.inventoryQuantity} units currently available`,
    "Official BJ Electronics support",
    "Secure transactional checkout",
    "Inventory verified before order confirmation",
  ];

  return (
    <div className="store-shell product-detail-shell">
      <StoreHeader adminUrl={adminUrl} />
      <main>
        <nav className="breadcrumbs detail-breadcrumbs"><Link href="/">Home</Link><span>›</span><Link href="/shop">Shop</Link><span>›</span><strong>{product.name}</strong></nav>
        <section className="product-detail-layout">
          <div className="product-gallery">
            <div className="product-thumbnails"><button className="active" type="button"><ProductArtwork product={product} /></button><button type="button"><ProductArtwork product={product} /></button><button type="button"><span className="detail-mini-badge">BJ</span></button></div>
            <div className="product-detail-media"><ProductArtwork product={product} priority /><span className="zoom-hint">⌕ Hover to inspect</span></div>
          </div>
          <section className="product-detail-copy">
            <p className="product-detail-category">BJ Electronics collection</p>
            <h1>{product.name}</h1>
            <div className="product-rating"><span>4.8</span><b>★★★★★</b><small>(128 reviews)</small><Link href={`/contact?topic=${encodeURIComponent(`Question about ${product.name}`)}`}>Ask a question</Link></div>
            <div className="product-price-line"><strong>{money(product.priceCents, product.currency)}</strong>{product.compareAtCents ? <del>{money(product.compareAtCents, product.currency)}</del> : null}<span className={product.inventoryQuantity > 0 ? "in-stock" : "out-stock"}>{product.inventoryQuantity > 0 ? "In stock" : "Out of stock"}</span></div>
            <p className="product-sku">SKU: {product.sku}</p>
            <div className="product-options"><span>Color: <strong>Midnight</strong></span><div className="color-options"><button className="active navy" type="button" aria-label="Midnight" /><button className="silver" type="button" aria-label="Silver" /><button className="gray" type="button" aria-label="Space gray" /><button className="gold" type="button" aria-label="Warm gold" /></div></div>
            <div className="product-features"><strong>Key features</strong><ul>{features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul></div>
            <div className="purchase-row"><label>Qty<div className="detail-quantity"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(Math.min(20, product.inventoryQuantity), value + 1))}>+</button></div></label><button className="detail-add-cart" type="button" disabled={adding || product.inventoryQuantity < 1} onClick={addToCart}>🛒 {adding ? "Adding…" : "Add to cart"}</button></div>
            <button className={`detail-wishlist${saved ? " saved" : ""}`} type="button" onClick={toggleWishlist}>{saved ? "♥ Saved to wishlist" : "♡ Add to wishlist"}</button>
            {message ? <div className="detail-message" role="status">{message}</div> : null}
          </section>
        </section>

        <section className="detail-service-strip">
          <article><span>▱</span><div><strong>Free delivery</strong><small>On qualifying orders</small></div></article><article><span>♢</span><div><strong>1 year warranty</strong><small>Official product coverage</small></div></article><article><span>↻</span><div><strong>Easy returns</strong><small>Clear support process</small></div></article><article><span>▣</span><div><strong>Secure checkout</strong><small>Inventory revalidation</small></div></article>
        </section>

        {similar.length ? <section className="retail-section similar-section"><div className="retail-section-heading"><div><span>Recommended for you</span><h2>Similar products</h2></div><Link href="/shop">View all</Link></div><div className="horizontal-product-grid">{similar.map((item) => <ProductCard compact product={item} key={item.id} />)}</div></section> : null}
      </main>
      <StoreFooter />
    </div>
  );
}
