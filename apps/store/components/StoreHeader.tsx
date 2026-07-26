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
  const [category, setCategory] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    void fetch("/api/cart", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { cart?: CommerceCart }) => setCartCount(payload.cart?.itemCount ?? 0))
      .catch(() => undefined);

    const readWishlist = () => {
      try {
        const value = JSON.parse(localStorage.getItem("bje-wishlist") ?? "[]") as unknown;
        setWishlistCount(Array.isArray(value) ? value.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    readWishlist();

    const cartListener = (event: Event) => setCartCount((event as CustomEvent<number>).detail ?? 0);
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
    const params = new URLSearchParams();
    const normalized = query.trim();
    if (normalized) params.set("q", normalized);
    if (category !== "all") params.set("category", category);
    const suffix = params.toString();
    router.push(suffix ? `/shop?${suffix}` : "/shop");
    setMenuOpen(false);
  }

  return (
    <>
      <div className="utility-bar">
        <div className="utility-inner">
          <div className="utility-contact">
            <span>Nationwide delivery across Bangladesh</span>
            <a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a>
          </div>
          <div>
            <span>Secure shopping</span>
            <Link href="/contact">Customer support</Link>
            <a href={adminUrl}>Admin portal</a>
          </div>
        </div>
      </div>

      <header className="commerce-header">
        <div className="commerce-header-main">
          <button className="mobile-menu-button" type="button" aria-label="Toggle store menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button>
          <Link className="commerce-logo" href="/" aria-label="BJ Electronics home"><BrandLogo /></Link>
          <form className="header-search" onSubmit={submitSearch} role="search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands and more…" aria-label="Search products" />
            <select aria-label="Search category" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button type="submit" aria-label="Submit search">Search</button>
          </form>
          <nav className="commerce-actions" aria-label="Store actions">
            <Link href="/wishlist" className="header-action"><span aria-hidden="true">♡</span><small>Wishlist</small>{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
            <Link href="/cart" className="header-action"><span aria-hidden="true">🛒</span><small>Cart</small>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
            <a href={adminUrl} className="header-action"><span aria-hidden="true">♙</span><small>Profile</small></a>
          </nav>
        </div>

        <nav className={`primary-store-nav${menuOpen ? " open" : ""}`} aria-label="Primary store navigation">
          <div className="primary-store-nav-inner">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
            <span className="primary-store-message">Trusted electronics. Clear service. Secure ordering.</span>
          </div>
        </nav>

        <nav className={`category-nav${menuOpen ? " open" : ""}`} aria-label="Product categories">
          <div className="category-nav-inner">
            <Link className="all-category-link" href="/shop" onClick={() => setMenuOpen(false)}>☰ All Categories</Link>
            {categories.map((item) => <Link key={item} href={`/shop?category=${encodeURIComponent(item)}`} onClick={() => setMenuOpen(false)}>{item}</Link>)}
            <Link className="nav-deal" href="/shop?sort=discount" onClick={() => setMenuOpen(false)}>Deals</Link>
          </div>
        </nav>
      </header>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/"><span>⌂</span>Home</Link>
        <Link href="/shop"><span>▦</span>Shop</Link>
        <Link href="/cart" className="mobile-cart-link"><span>🛒</span>Cart{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
        <Link href="/contact"><span>◎</span>Contact</Link>
      </nav>
    </>
  );
}
