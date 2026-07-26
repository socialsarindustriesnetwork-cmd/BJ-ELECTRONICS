"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CommerceCart } from "@bje/database/transactions";

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function CartClient() {
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [promo, setPromo] = useState("");
  const [promoNote, setPromoNote] = useState("");

  useEffect(() => {
    void fetch("/api/cart", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { cart?: CommerceCart; error?: string };
        if (!response.ok || !payload.cart) throw new Error(payload.error || "Could not load the cart.");
        setCart(payload.cart);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load the cart."))
      .finally(() => setLoading(false));
  }, []);

  async function setQuantity(productId: string, quantity: number) {
    setUpdating(productId);
    setError("");
    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const payload = await response.json() as { cart?: CommerceCart; error?: string };
      if (!response.ok || !payload.cart) throw new Error(payload.error || "Could not update the cart.");
      setCart(payload.cart);
      window.dispatchEvent(new CustomEvent("bje:cart", { detail: payload.cart.itemCount }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the cart.");
    } finally {
      setUpdating(null);
    }
  }

  function applyPromo() {
    const normalized = promo.trim();
    setPromoNote(normalized ? "Promo codes are verified during assisted checkout. Contact support for an active offer." : "Enter a promo code first.");
  }

  if (loading) return <div className="cart-state">Loading your secure cart…</div>;
  if (!cart) return <div className="cart-state error-state">{error || "The cart is unavailable."}</div>;
  if (!cart.lines.length) {
    return (
      <section className="empty-cart">
        <span>🛒</span>
        <h1>Your cart is empty.</h1>
        <p>Browse the BJ Electronics catalog and add products when you are ready.</p>
        <Link className="shop-primary" href="/categories">Browse products</Link>
      </section>
    );
  }

  return (
    <>
      <div className="cart-layout reference-cart-layout">
        <section className="cart-panel">
          <div className="panel-title"><div><p className="eyebrow">Your cart</p><h1>{cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}</h1></div><Link href="/categories">Continue shopping</Link></div>
          {error ? <div className="form-error">{error}</div> : null}
          <div className="cart-lines">
            {cart.lines.map((line) => (
              <article className="cart-line" key={line.productId}>
                <Link className="cart-thumb" href={`/products/${line.slug}`}>{line.imageUrl ? <img src={line.imageUrl} alt={line.name} /> : <span>{line.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}</span>}</Link>
                <div className="cart-line-copy"><Link href={`/products/${line.slug}`}><strong>{line.name}</strong></Link><span>{line.sku}</span><span>{line.inventoryQuantity} currently available</span></div>
                <div className="quantity-control" aria-label={`Quantity for ${line.name}`}><button type="button" disabled={updating === line.productId || line.quantity <= 1} onClick={() => setQuantity(line.productId, line.quantity - 1)}>−</button><span>{line.quantity}</span><button type="button" disabled={updating === line.productId || line.quantity >= Math.min(20, line.inventoryQuantity)} onClick={() => setQuantity(line.productId, line.quantity + 1)}>+</button></div>
                <strong className="cart-line-price">{money(line.lineTotalCents, cart.currency)}</strong>
                <button className="remove-button" type="button" disabled={updating === line.productId} onClick={() => setQuantity(line.productId, 0)}>Remove</button>
              </article>
            ))}
          </div>
          <div className="promo-entry"><label><span>Have a promo code?</span><div><input value={promo} onChange={(event) => setPromo(event.target.value)} placeholder="Enter code" /><button type="button" onClick={applyPromo}>Apply</button></div></label>{promoNote ? <p>{promoNote}</p> : null}</div>
        </section>

        <aside className="cart-summary sticky-summary">
          <h2>Order summary</h2>
          <div><span>Subtotal</span><strong>{money(cart.subtotalCents, cart.currency)}</strong></div>
          <div><span>Shipping</span><strong>{cart.estimatedShippingCents ? money(cart.estimatedShippingCents, cart.currency) : "FREE"}</strong></div>
          <div><span>Tax</span><strong>Calculated at checkout</strong></div>
          <div className="summary-total"><span>Estimated total</span><strong>{money(cart.estimatedTotalCents, cart.currency)}</strong></div>
          <p>Prices and inventory are revalidated before your order is created.</p>
          <Link className="checkout-button" href="/checkout">Proceed to checkout</Link>
          <div className="express-payment"><span>Secure payment methods</span><div><b>VISA</b><b>MC</b><b>COD</b><b>BANK</b></div></div>
        </aside>
      </div>
      <section className="detail-service-strip cart-service-strip"><article><span>▱</span><div><strong>Free delivery</strong><small>On qualifying orders</small></div></article><article><span>♢</span><div><strong>1 year warranty</strong><small>Official coverage</small></div></article><article><span>↻</span><div><strong>Easy returns</strong><small>Responsive assistance</small></div></article><article><span>▣</span><div><strong>Secure payment</strong><small>Protected checkout</small></div></article></section>
    </>
  );
}
