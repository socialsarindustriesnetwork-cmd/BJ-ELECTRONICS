"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommerceCart } from "@bje/database/transactions";
import { BrandLogo } from "@bje/ui";

const categories = ["Laptops", "Earphones", "Headphones", "Smart Watches", "Speakers", "Accessories", "Monitors", "Power Banks"];

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function StoreHeader({ adminUrl }: { adminUrl: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
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

    const cartListener = () => loadCart();
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
    const parameters = new URLSearchParams();
    if (query.trim()) parameters.set("q", query.trim());
    if (category !== "all") parameters.set("category", category);
    const search = parameters.toString();
    router.push(search ? `/categories?${search}` : "/categories");
    setMenuOpen(false);
  }

  return (
    <>
      <div className="caravan-contact-bar">
        <div className="caravan-contact-inner">
          <div><a href="tel:+8801600000000">+880 1600-000000</a><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a><span>Sat–Thu: 9:00–18:30</span></div>
          <div className="caravan-socials"><a href="mailto:support@bjelectronics.shop?subject=Facebook">f</a><a href="mailto:support@bjelectronics.shop?subject=Instagram">◎</a><a href="mailto:support@bjelectronics.shop?subject=WhatsApp">◉</a><a href="mailto:support@bjelectronics.shop?subject=YouTube">▶</a></div>
        </div>
      </div>
      <header className="caravan-commerce-header">
        <div className="caravan-header-main">
          <button className="mobile-menu-button" type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button>
          <Link className="commerce-logo" href="/" aria-label="BJ Electronics home"><BrandLogo /></Link>
          <nav className={`caravan-main-nav${menuOpen ? " open" : ""}`} aria-label="Main navigation">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/categories" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/categories?sort=discount" onClick={() => setMenuOpen(false)}>Deals</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist{wishlistCount ? <b>{wishlistCount}</b> : null}</Link>
          </nav>
          <div className="caravan-header-actions">
            <a className="caravan-admin-link" href={adminUrl}>Profile</a>
            <Link className="caravan-cart-summary" href="/cart" aria-label={`${cartCount} items in cart`}><span>🛒</span><div><small>{cartCount} item{cartCount === 1 ? "" : "s"}</small><strong>{formatMoney(cartTotal, cartCurrency)}</strong></div>{cartCount ? <b>{cartCount}</b> : null}</Link>
          </div>
        </div>
        <div className="caravan-search-row">
          <Link className="all-category-link" href="/categories">☰ All Categories</Link>
          <form className="caravan-search" onSubmit={submitSearch} role="search">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands and more…" aria-label="Search products" />
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Search category">
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button type="submit" aria-label="Submit search">⌕</button>
          </form>
          <Link className="header-deal-link" href="/categories?sort=discount">Today&apos;s deals</Link>
        </div>
      </header>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/"><span>⌂</span>Home</Link>
        <Link href="/categories"><span>▦</span>Categories</Link>
        <Link href="/wishlist"><span>♡</span>Wishlist{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
        <Link href="/cart" className="mobile-cart-link"><span>🛒</span>Cart{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
      </nav>
    </>
  );
}
