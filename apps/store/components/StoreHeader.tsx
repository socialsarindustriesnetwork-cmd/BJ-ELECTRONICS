"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CommerceCart } from "@bje/database/transactions";
import { BrandLogo } from "@bje/ui";

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function StoreHeader({ adminUrl }: { adminUrl: string }) {
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const refreshCart = () => {
      void fetch("/api/cart", { cache: "no-store" })
        .then((response) => response.json())
        .then((payload: { cart?: CommerceCart }) => setCart(payload.cart ?? null))
        .catch(() => undefined);
    };

    refreshCart();
    const cartListener = () => refreshCart();
    window.addEventListener("bje:cart", cartListener);
    return () => window.removeEventListener("bje:cart", cartListener);
  }, []);

  const itemCount = cart?.itemCount ?? 0;
  const total = cart ? money(cart.estimatedTotalCents, cart.currency) : "৳0";

  return (
    <>
      <div className="caravan-utility">
        <div className="caravan-utility-inner">
          <div className="caravan-contact-strip">
            <a href="mailto:support@bjelectronics.shop">✉ support@bjelectronics.shop</a>
            <span>◷ Sat–Thu: 9:00–18:30</span>
            <span>⌖ Delivery across Bangladesh</span>
          </div>
          <div className="caravan-social-strip" aria-label="Store services">
            <Link href="/contact">Support</Link>
            <Link href="/policies/shipping">Delivery</Link>
            <a href={adminUrl}>Account</a>
          </div>
        </div>
      </div>

      <header className="caravan-header">
        <div className="caravan-header-inner">
          <button
            className="caravan-menu-button"
            type="button"
            aria-label="Toggle store menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            ☰
          </button>

          <Link className="caravan-logo" href="/" aria-label="BJ Electronics home">
            <BrandLogo />
          </Link>

          <nav className={`caravan-main-nav${menuOpen ? " open" : ""}`} aria-label="Primary navigation">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          </nav>

          <div className="caravan-cart-summary">
            <Link href="/wishlist" className="caravan-wishlist" aria-label="Wishlist">♡</Link>
            <Link href="/cart" aria-label={`${itemCount} items in cart`}>
              <span className="caravan-cart-icon">🛒</span>
              <span><strong>{total}</strong><small>{itemCount} Cart</small></span>
              {itemCount > 0 ? <b>{itemCount}</b> : null}
            </Link>
          </div>
        </div>
      </header>

      <nav className="caravan-mobile-nav" aria-label="Mobile store navigation">
        <Link href="/"><span>⌂</span>Home</Link>
        <Link href="/shop"><span>▦</span>Shop</Link>
        <Link href="/cart"><span>🛒</span>Cart{itemCount > 0 ? <b>{itemCount}</b> : null}</Link>
        <Link href="/contact"><span>✉</span>Contact</Link>
      </nav>
    </>
  );
}