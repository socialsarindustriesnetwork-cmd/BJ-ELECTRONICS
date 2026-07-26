"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommerceCart } from "@bje/database/transactions";
import { BrandLogo } from "@bje/ui";

const categories = ["Laptops", "Earphones", "Headphones", "Smart Watches", "Speakers", "Accessories", "Monitors", "Power Banks"];

export function StoreHeader({ adminUrl }: { adminUrl: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCurrency, setCartCurrency] = useState("USD");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadCart = () => {
      void fetch("/api/cart", { cache: "no-store" })
        .then((response) => response.json())
        .then((payload: { cart?: CommerceCart }) => {
          setCartCount(payload.cart?.itemCount ?? 0);
          setCartTotal(payload.cart?.estimatedTotalCents ?? 0);
          setCartCurrency(payload.cart?.currency ?? "USD");
        })
        .catch(() => undefined);
    };

    loadCart();

    const readWishlist = () => {
      try {
        const value = JSON.parse(localStorage.getItem("bje-wishlist") ?? "[]") as unknown;
        setWishlistCount(Array.isArray(value) ? value.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    readWishlist();

    const cartListener = (event: Event) => {
      setCartCount((event as CustomEvent<number>).detail ?? 0);
      loadCart();
    };
    const wishlistListener = () => readWishlist();
    window.addEventListener("bje:cart", cartListener);
    window.addEventListener("bje:wishlist", wishlistListener);
    return () => {
      window.removeEventListener("bje:cart", cartListener);
      window.removeEventListener("bje:wishlist", wishlistListener);
    };
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim();
    router.push(normalized ? `/categories?q=${encodeURIComponent(normalized)}` : "/categories");
    setMenuOpen(false);
  }

  const formattedCartTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cartCurrency,
  }).format(cartTotal / 100);

  return (
    <>
      <div className="utility-bar caravan-utility">
        <div className="utility-inner">
          <div className="utility-contact">
            <a href="mailto:support@bjelectronics.shop">✉ support@bjelectronics.shop</a>
            <span>Sat–Thu · 9:00 AM–6:30 PM</span>
          </div>
          <div className="utility-links">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <a href={adminUrl}>Administration</a>
          </div>
        </div>
      </div>

      <header className="commerce-header caravan-header">
        <div className="commerce-header-main">
          <button className="mobile-menu-button" type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button>
          <Link className="commerce-logo" href="/" aria-label="BJ Electronics home"><BrandLogo /></Link>

          <form className="header-search caravan-search" onSubmit={submitSearch} role="search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands and categories…" aria-label="Search products" />
            <select aria-label="Search category" defaultValue="all">
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </form>

          <nav className="commerce-actions" aria-label="Account actions">
            <Link href="/wishlist" className="header-action"><span aria-hidden="true">♡</span><small>Wishlist</small>{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
            <Link href="/cart" className="header-action caravan-cart-action"><span aria-hidden="true">🛒</span><small>{cartCount} item{cartCount === 1 ? "" : "s"}</small><em>{formattedCartTotal}</em>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
            <a href={adminUrl} className="header-action"><span aria-hidden="true">♙</span><small>Profile</small></a>
          </nav>
        </div>

        <nav className={`primary-store-nav${menuOpen ? " open" : ""}`} aria-label="Primary store navigation">
          <div className="primary-store-nav-inner">
            <Link href="/">Home</Link>
            <Link href="/categories">Shop</Link>
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact us</Link>
            <Link className="primary-nav-deal" href="/categories?sort=discount">Special offers</Link>
          </div>
        </nav>

        <nav className={`category-nav caravan-category-nav${menuOpen ? " open" : ""}`} aria-label="Product categories">
          <div className="category-nav-inner">
            <Link className="all-category-link" href="/categories">☰ Browse all</Link>
            {categories.map((category) => <Link key={category} href={`/categories?category=${encodeURIComponent(category)}`}>{category}</Link>)}
          </div>
        </nav>
      </header>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/"><span>⌂</span>Home</Link>
        <Link href="/categories"><span>▦</span>Shop</Link>
        <Link href="/cart" className="mobile-cart-link"><span>🛒</span>Cart{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
        <Link href="/contact"><span>✉</span>Contact</Link>
      </nav>
    </>
  );
}