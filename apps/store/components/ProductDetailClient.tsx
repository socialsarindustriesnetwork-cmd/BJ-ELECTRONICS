"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@bje/database";
import type { CommerceCart } from "@bje/database/transactions";
import { ProductArtwork } from "@/components/ProductArtwork";
import { ProductCard } from "@/components/ProductCard";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { marketplaceCategoryLabel, productBrand } from "@/lib/marketplace";

function money(cents: number, currency: string): string { return new Intl.NumberFormat("en-BD", { style: "currency", currency }).format(cents / 100); }
function wishlistIds(): string[] { try { const value = JSON.parse(localStorage.getItem("bje-wishlist") ?? "[]") as unknown; return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; } catch { return []; } }

export function ProductDetailClient({ product, similar, adminUrl }: { product: Product; similar: Product[]; adminUrl: string }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  useEffect(() => setSaved(wishlistIds().includes(product.id)), [product.id]);

  async function addToCart() {
    setAdding(true); setMessage("");
    try {
      const currentResponse = await fetch("/api/cart", { cache: "no-store" });
      const currentPayload = await currentResponse.json() as { cart?: CommerceCart };
      const currentQuantity = currentPayload.cart?.lines.find((line) => line.productId === product.id)?.quantity ?? 0;
      const response = await fetch("/api/cart/items", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: product.id, quantity: currentQuantity + quantity }) });
      const payload = await response.json() as { cart?: CommerceCart; error?: string };
      if (!response.ok || !payload.cart) throw new Error(payload.error || "Could not add this product.");
      window.dispatchEvent(new CustomEvent("bje:cart", { detail: payload.cart.itemCount }));
      setMessage(`${quantity} item${quantity === 1 ? "" : "s"} added to your cart.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not add this product."); } finally { setAdding(false); }
  }

  function toggleWishlist() {
    const current = wishlistIds();
    const next = current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id];
    localStorage.setItem("bje-wishlist", JSON.stringify(next)); setSaved(next.includes(product.id)); window.dispatchEvent(new Event("bje:wishlist"));
  }

  const category = marketplaceCategoryLabel(product);
  const brand = productBrand(product);
  const features = [product.description, `${product.inventoryQuantity} units currently available`, `Official ${brand} product support`, "Secure transactional checkout", "Inventory verified before order confirmation"];

  return (
    <div className="store-shell marketplace-product-shell">
      <StoreHeader adminUrl={adminUrl} />
      <main className="marketplace-product-main">
        <nav className="breadcrumbs product-market-breadcrumbs"><Link href="/">Home</Link><span>›</span><Link href="/categories">Shop</Link><span>›</span><Link href={`/categories?category=${encodeURIComponent(category)}`}>{category}</Link><span>›</span><strong>{product.name}</strong></nav>
        <section className="marketplace-product-layout">
          <div className="marketplace-gallery"><div className="marketplace-thumbnails">{[0,1,2,3].map((index) => <button className={selectedImage === index ? "active" : ""} type="button" onClick={() => setSelectedImage(index)} key={index}><ProductArtwork product={product} /></button>)}</div><div className={`marketplace-product-media media-angle-${selectedImage}`}><ProductArtwork product={product} priority /><span className="product-zoom-note">⌕ Hover to inspect</span>{product.compareAtCents && product.compareAtCents > product.priceCents ? <b className="market-detail-sale">Special price</b> : null}</div></div>
          <section className="marketplace-product-copy">
            <div className="product-brand-line"><span>{brand}</span><Link href="/contact">Ask about this product</Link></div><h1>{product.name}</h1>
            <div className="product-rating market-rating"><b>★★★★★</b><strong>4.8</strong><small>128 verified reviews</small><span>SKU: {product.sku}</span></div>
            <div className="market-product-price"><strong>{money(product.priceCents, product.currency)}</strong>{product.compareAtCents ? <del>{money(product.compareAtCents, product.currency)}</del> : null}<span>VAT included where applicable</span></div>
            <div className={`market-stock-box ${product.inventoryQuantity > 0 ? "available" : "unavailable"}`}><span>{product.inventoryQuantity > 0 ? "✓" : "!"}</span><div><strong>{product.inventoryQuantity > 0 ? "Available for order" : "Temporarily unavailable"}</strong><small>{product.inventoryQuantity > 0 ? `${product.inventoryQuantity} units in current inventory` : "Contact support for availability updates"}</small></div></div>
            <div className="market-installment-box"><span>EMI</span><div><strong>Flexible purchase support</strong><small>Contact the BJ Electronics team for eligible instalment and business-sale options.</small></div></div>
            <div className="market-product-features"><strong>Product highlights</strong><ul>{features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul></div>
            <div className="market-purchase-panel"><label>Quantity<div className="detail-quantity"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(Math.max(1, Math.min(20, product.inventoryQuantity)), value + 1))}>+</button></div></label><button className="market-add-cart" type="button" disabled={adding || product.inventoryQuantity < 1} onClick={addToCart}>🛒 {adding ? "Adding…" : "Add to cart"}</button><button className={`market-wishlist-button${saved ? " saved" : ""}`} type="button" onClick={toggleWishlist}>{saved ? "♥ Saved" : "♡ Wishlist"}</button></div>
            {message ? <div className="detail-message" role="status">{message}</div> : null}
            <div className="market-delivery-preview"><article><span>🚚</span><div><strong>Nationwide delivery</strong><small>Delivery timing is confirmed after order review.</small></div></article><article><span>♢</span><div><strong>Official warranty</strong><small>Coverage depends on the specific brand and model.</small></div></article><article><span>↻</span><div><strong>Support after purchase</strong><small>Customer care remains available for fulfilment questions.</small></div></article></div>
          </section>
        </section>
        <section className="market-product-info-tabs"><div className="info-tab-head"><button className="active" type="button">Description</button><button type="button">Specifications</button><button type="button">Delivery & warranty</button></div><div className="info-tab-body"><div><span>BJ Electronics product overview</span><h2>Reliable technology for modern living.</h2><p>{product.description}</p><p>Product availability, price and publication status are controlled through the secure BJ Electronics administration platform. Final inventory is revalidated before an order is created.</p></div><dl><div><dt>Brand</dt><dd>{brand}</dd></div><div><dt>Category</dt><dd>{category}</dd></div><div><dt>Model / SKU</dt><dd>{product.sku}</dd></div><div><dt>Availability</dt><dd>{product.inventoryQuantity > 0 ? "In stock" : "Out of stock"}</dd></div><div><dt>Currency</dt><dd>{product.currency}</dd></div></dl></div></section>
        {similar.length ? <section className="market-section similar-market-section"><div className="market-section-heading"><div><span>Recommended for you</span><h2>Similar products</h2><p>Compare related products from the current live catalog.</p></div><Link href={`/categories?category=${encodeURIComponent(category)}`}>View category</Link></div><div className="market-product-row">{similar.map((item) => <ProductCard compact product={item} key={item.id} />)}</div></section> : null}
      </main><StoreFooter />
    </div>
  );
}
