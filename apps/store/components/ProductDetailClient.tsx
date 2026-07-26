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

const colors = [
  { name: "Midnight", className: "navy" },
  { name: "Silver", className: "silver" },
  { name: "Space gray", className: "gray" },
  { name: "Warm gold", className: "gold" },
];

export function ProductDetailClient({ product, similar, adminUrl }: { product: Product; similar: Product[]; adminUrl: string }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? "Standard");
  const [tab, setTab] = useState<"details" | "delivery" | "support">("details");
  const [deliveryArea, setDeliveryArea] = useState("Bangladesh");
  const [shareUrl, setShareUrl] = useState(`/products/${product.slug}`);

  useEffect(() => {
    setSaved(wishlistIds().includes(product.id));
    setShareUrl(window.location.href);
    const storedArea = localStorage.getItem("bje-delivery-area");
    if (storedArea) setDeliveryArea(storedArea);
    try {
      const current = JSON.parse(localStorage.getItem("bje-recent-products") ?? "[]") as unknown;
      const ids = Array.isArray(current) ? current.filter((item): item is string => typeof item === "string") : [];
      localStorage.setItem("bje-recent-products", JSON.stringify([product.id, ...ids.filter((id) => id !== product.id)].slice(0, 12)));
    } catch {
      localStorage.setItem("bje-recent-products", JSON.stringify([product.id]));
    }
  }, [product.id, product.slug]);

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
    "Official BJ Electronics customer support",
    "Secure transactional checkout",
    "Inventory verified before order confirmation",
  ];
  const discount = product.compareAtCents && product.compareAtCents > product.priceCents
    ? Math.round((1 - product.priceCents / product.compareAtCents) * 100)
    : 0;
  const shareHref = `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(`View this product at ${shareUrl}`)}`;

  return (
    <div className="store-shell product-detail-shell marketplace-product-shell">
      <StoreHeader adminUrl={adminUrl} />
      <main className="marketplace-product-main">
        <nav className="breadcrumbs detail-breadcrumbs"><Link href="/">Home</Link><span>›</span><Link href="/categories">Products</Link><span>›</span><strong>{product.name}</strong></nav>

        <section className="marketplace-product-grid">
          <div className="product-gallery marketplace-product-gallery">
            <div className="product-thumbnails"><button className="active" type="button"><ProductArtwork product={product} /></button><button type="button"><ProductArtwork product={product} /></button><button type="button"><span className="detail-mini-badge">BJ</span></button></div>
            <div className="product-detail-media marketplace-product-media"><ProductArtwork product={product} priority />{discount ? <span className="marketplace-discount-badge">-{discount}%</span> : null}<span className="zoom-hint">⌕ Product view</span></div>
            <div className="gallery-share-row"><button type="button" onClick={toggleWishlist}>{saved ? "♥ Saved" : "♡ Save product"}</button><a href={shareHref}>↗ Share</a></div>
          </div>

          <section className="product-detail-copy marketplace-product-copy">
            <p className="product-detail-category">BJ Electronics official catalog</p>
            <h1>{product.name}</h1>
            <div className="product-rating marketplace-rating"><span>4.8</span><b>★★★★★</b><small>Customer rating</small><a href="mailto:support@bjelectronics.shop?subject=Question%20about%20product">Ask a question</a></div>
            <div className="product-price-line marketplace-price-line"><strong>{money(product.priceCents, product.currency)}</strong>{product.compareAtCents ? <del>{money(product.compareAtCents, product.currency)}</del> : null}{discount ? <b>Save {discount}%</b> : null}</div>
            <div className="marketplace-stock-row"><span className={product.inventoryQuantity > 0 ? "in-stock" : "out-stock"}>{product.inventoryQuantity > 0 ? "● In stock" : "● Out of stock"}</span><small>SKU: {product.sku}</small></div>

            <div className="product-options marketplace-product-options"><span>Color: <strong>{selectedColor}</strong></span><div className="color-options">{colors.map((color) => <button key={color.name} className={`${color.className}${selectedColor === color.name ? " active" : ""}`} type="button" aria-label={color.name} onClick={() => setSelectedColor(color.name)} />)}</div></div>
            <div className="product-features marketplace-feature-list"><strong>Product highlights</strong><ul>{features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul></div>

            <div className="marketplace-product-tabs" role="tablist" aria-label="Product information"><button className={tab === "details" ? "active" : ""} type="button" onClick={() => setTab("details")}>Details</button><button className={tab === "delivery" ? "active" : ""} type="button" onClick={() => setTab("delivery")}>Delivery</button><button className={tab === "support" ? "active" : ""} type="button" onClick={() => setTab("support")}>Support</button></div>
            <div className="marketplace-tab-panel">{tab === "details" ? <p>{product.description}</p> : null}{tab === "delivery" ? <p>Delivery is coordinated to {deliveryArea}. Final timing and any applicable charge are confirmed during order processing.</p> : null}{tab === "support" ? <p>BJ Electronics provides product guidance, order support and warranty coordination. Manufacturer coverage varies by product.</p> : null}</div>
          </section>

          <aside className="marketplace-buy-box">
            <div className="buy-box-price"><small>Current price</small><strong>{money(product.priceCents, product.currency)}</strong>{product.compareAtCents ? <del>{money(product.compareAtCents, product.currency)}</del> : null}</div>
            <div className="buy-box-delivery"><span>⌖</span><div><small>Deliver to</small><strong>{deliveryArea}</strong></div><a href="mailto:support@bjelectronics.shop?subject=Delivery%20question">Check</a></div>
            <div className="buy-box-stock"><strong>{product.inventoryQuantity > 0 ? "Available to order" : "Currently unavailable"}</strong><small>{product.inventoryQuantity > 0 ? `${product.inventoryQuantity} units in live inventory` : "Contact support for availability guidance"}</small></div>
            <label className="buy-box-quantity">Quantity<div className="detail-quantity"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(Math.min(20, product.inventoryQuantity), value + 1))}>+</button></div></label>
            <button className="buy-box-cart" type="button" disabled={adding || product.inventoryQuantity < 1} onClick={addToCart}>🛒 {adding ? "Adding…" : "Add to cart"}</button>
            <Link className="buy-box-checkout" href="/cart">View cart & checkout</Link>
            <button className={`buy-box-wishlist${saved ? " saved" : ""}`} type="button" onClick={toggleWishlist}>{saved ? "♥ Saved to wishlist" : "♡ Add to wishlist"}</button>
            {message ? <div className="detail-message" role="status">{message}</div> : null}
            <div className="buy-box-payment"><strong>Payment options</strong><span>Cash on delivery</span><span>Bank transfer</span></div>
            <div className="buy-box-guarantee"><span>✓</span><div><strong>Secure order creation</strong><small>Price and inventory are validated before confirmation.</small></div></div>
          </aside>
        </section>

        <section className="detail-service-strip marketplace-detail-services">
          <article><span>▱</span><div><strong>Countrywide delivery</strong><small>Coordinated across Bangladesh</small></div></article><article><span>♢</span><div><strong>Warranty support</strong><small>Coverage varies by product</small></div></article><article><span>↻</span><div><strong>Return assistance</strong><small>Clear support process</small></div></article><article><span>▣</span><div><strong>Secure checkout</strong><small>Transactional validation</small></div></article>
        </section>

        {similar.length ? <section className="retail-section similar-section"><div className="retail-section-heading"><div><span>Recommended for you</span><h2>Similar products</h2></div><Link href="/categories">View all</Link></div><div className="horizontal-product-grid">{similar.map((item) => <ProductCard compact product={item} key={item.id} />)}</div></section> : null}
      </main>
      <StoreFooter />
    </div>
  );
}
