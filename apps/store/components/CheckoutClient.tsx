"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { CommerceCart } from "@bje/database/transactions";

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

type CheckoutFields = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  customerNote: string;
  paymentMethod: "CASH_ON_DELIVERY" | "BANK_TRANSFER";
};

const initialFields: CheckoutFields = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "BD",
  customerNote: "",
  paymentMethod: "CASH_ON_DELIVERY",
};

export function CheckoutClient() {
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [fields, setFields] = useState(initialFields);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  function update<K extends keyof CheckoutFields>(key: K, value: CheckoutFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart?.lines.length) return;
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      const payload = await response.json() as {
        redirectUrl?: string;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok || !payload.redirectUrl) {
        setFieldErrors(payload.fields ?? {});
        throw new Error(payload.error || "Checkout could not be completed.");
      }
      window.location.assign(payload.redirectUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Checkout could not be completed.");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="cart-state">Preparing secure checkout…</div>;
  if (!cart) return <div className="cart-state error-state">{error || "Checkout is unavailable."}</div>;
  if (!cart.lines.length) {
    return (
      <section className="empty-cart">
        <span>▢</span><h1>Your cart is empty.</h1><p>Add products before opening checkout.</p>
        <Link className="primary-link" href="/#catalog">Browse products</Link>
      </section>
    );
  }

  return (
    <form className="checkout-layout" onSubmit={submit} noValidate>
      <section className="checkout-panel">
        <div className="panel-title"><div><p className="eyebrow">Secure checkout</p><h1>Delivery and payment</h1></div><Link href="/cart">Edit cart</Link></div>
        {error ? <div className="form-error" role="alert">{error}</div> : null}

        <fieldset className="checkout-section">
          <legend>Contact information</legend>
          <div className="field-grid two-column">
            <label><span>Full name</span><input autoComplete="name" value={fields.customerName} onChange={(event) => update("customerName", event.target.value)} required />{fieldErrors.customerName ? <small>{fieldErrors.customerName}</small> : null}</label>
            <label><span>Email address</span><input type="email" autoComplete="email" value={fields.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} required />{fieldErrors.customerEmail ? <small>{fieldErrors.customerEmail}</small> : null}</label>
            <label><span>Phone number</span><input type="tel" autoComplete="tel" value={fields.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} required />{fieldErrors.customerPhone ? <small>{fieldErrors.customerPhone}</small> : null}</label>
          </div>
        </fieldset>

        <fieldset className="checkout-section">
          <legend>Delivery address</legend>
          <div className="field-grid two-column">
            <label className="full-field"><span>Address line 1</span><input autoComplete="address-line1" value={fields.addressLine1} onChange={(event) => update("addressLine1", event.target.value)} required />{fieldErrors.addressLine1 ? <small>{fieldErrors.addressLine1}</small> : null}</label>
            <label className="full-field"><span>Address line 2 <em>Optional</em></span><input autoComplete="address-line2" value={fields.addressLine2} onChange={(event) => update("addressLine2", event.target.value)} /></label>
            <label><span>City</span><input autoComplete="address-level2" value={fields.city} onChange={(event) => update("city", event.target.value)} required />{fieldErrors.city ? <small>{fieldErrors.city}</small> : null}</label>
            <label><span>Region or district</span><input autoComplete="address-level1" value={fields.region} onChange={(event) => update("region", event.target.value)} /></label>
            <label><span>Postal code</span><input autoComplete="postal-code" value={fields.postalCode} onChange={(event) => update("postalCode", event.target.value)} /></label>
            <label><span>Country code</span><input autoComplete="country" maxLength={2} value={fields.country} onChange={(event) => update("country", event.target.value.toUpperCase())} required />{fieldErrors.country ? <small>{fieldErrors.country}</small> : null}</label>
            <label className="full-field"><span>Delivery note <em>Optional</em></span><textarea rows={3} value={fields.customerNote} onChange={(event) => update("customerNote", event.target.value)} /></label>
          </div>
        </fieldset>

        <fieldset className="checkout-section">
          <legend>Payment method</legend>
          <div className="payment-options">
            <label className={fields.paymentMethod === "CASH_ON_DELIVERY" ? "selected" : ""}>
              <input type="radio" name="paymentMethod" checked={fields.paymentMethod === "CASH_ON_DELIVERY"} onChange={() => update("paymentMethod", "CASH_ON_DELIVERY")} />
              <span><strong>Cash on delivery</strong><small>Pay when your order is delivered.</small></span>
            </label>
            <label className={fields.paymentMethod === "BANK_TRANSFER" ? "selected" : ""}>
              <input type="radio" name="paymentMethod" checked={fields.paymentMethod === "BANK_TRANSFER"} onChange={() => update("paymentMethod", "BANK_TRANSFER")} />
              <span><strong>Bank transfer</strong><small>Transfer instructions are confirmed by the operations team.</small></span>
            </label>
          </div>
        </fieldset>
      </section>

      <aside className="checkout-summary sticky-summary">
        <h2>Order review</h2>
        <div className="checkout-items">
          {cart.lines.map((line) => (
            <div key={line.productId}><span>{line.name}<small>Quantity {line.quantity}</small></span><strong>{money(line.lineTotalCents, cart.currency)}</strong></div>
          ))}
        </div>
        <div className="summary-divider" />
        <div><span>Subtotal</span><strong>{money(cart.subtotalCents, cart.currency)}</strong></div>
        <div><span>Shipping</span><strong>{cart.estimatedShippingCents ? money(cart.estimatedShippingCents, cart.currency) : "Free"}</strong></div>
        <div className="summary-total"><span>Total</span><strong>{money(cart.estimatedTotalCents, cart.currency)}</strong></div>
        <button className="checkout-button" type="submit" disabled={submitting}>{submitting ? "Creating secure order…" : "Place order"}</button>
        <p className="secure-note">Inventory and prices are checked atomically before your order is accepted.</p>
      </aside>
    </form>
  );
}
