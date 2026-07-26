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
    router.push(params.size ? `/categories?${params.toString()}` : "/categories");
    setMenuOpen(false);
  }

  return (
    <>
      <div className="utility-bar reference-utility-bar">
        <div className="utility-inner reference-utility-inner">
          <div className="utility-contact">
            <a href="mailto:support@bjelectronics.shop">✉ support@bjelectronics.shop</a>
            <span>Bangladesh-wide delivery</span>
            <span>Secure online ordering</span>
          </div>
          <div className="utility-links">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <a href={adminUrl}>Admin portal</a>
          </div>
        </div>
      </div>
      <header className="commerce-header reference-commerce-header">
        <div className="commerce-header-main">
          <button className="mobile-menu-button" type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button>
          <Link className="commerce-logo" href="/" aria-label="BJ Electronics home"><BrandLogo /></Link>
          <form className="header-search" onSubmit={submitSearch} role="search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands and more…" aria-label="Search products" />
            <select aria-label="Search category" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </form>
          <nav className="commerce-actions" aria-label="Account actions">
            <Link href="/wishlist" className="header-action"><span aria-hidden="true">♡</span><small>Wishlist</small>{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
            <Link href="/cart" className="header-action"><span aria-hidden="true">🛒</span><small>Cart</small>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
            <a href={adminUrl} className="header-action"><span aria-hidden="true">♙</span><small>Profile</small></a>
          </nav>
        </div>
        <nav className={`category-nav reference-category-nav${menuOpen ? " open" : ""}`} aria-label="Store navigation">
          <div className="category-nav-inner reference-category-nav-inner">
            <div className="reference-primary-nav">
              <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
              <Link href="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            </div>
            <div className="reference-category-links">
              <Link className="all-category-link" href="/categories" onClick={() => setMenuOpen(false)}>☰ All Categories</Link>
              {categories.slice(0, 6).map((item) => <Link key={item} href={`/categories?category=${encodeURIComponent(item)}`} onClick={() => setMenuOpen(false)}>{item}</Link>)}
              <Link className="nav-deal" href="/categories?sort=discount" onClick={() => setMenuOpen(false)}>Deals</Link>
            </div>
          </div>
        </nav>
      </header>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/"><span>⌂</span>Home</Link>
        <Link href="/shop"><span>▦</span>Shop</Link>
        <Link href="/cart" className="mobile-cart-link"><span>🛒</span>Cart{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
        <Link href="/wishlist"><span>♡</span>Wishlist{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
        <a href={adminUrl}><span>♙</span>Profile</a>
      </nav>
    </>
  );
}
