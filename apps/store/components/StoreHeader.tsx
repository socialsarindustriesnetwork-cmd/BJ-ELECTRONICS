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
  const [selectedCategory, setSelectedCategory] = useState("all");
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
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    const suffix = params.toString();
    router.push(suffix ? `/categories?${suffix}` : "/categories");
    setMenuOpen(false);
  }

  return (
    <>
      <div className="utility-bar marketplace-utility-bar">
        <div className="utility-inner">
          <span>Nationwide delivery support across Bangladesh</span>
          <div>
            <Link href="/track-order">Track order</Link>
            <Link href="/categories?sort=discount">Offers</Link>
            <a href="mailto:support@bjelectronics.shop">Customer care</a>
            <a href={adminUrl}>Admin portal</a>
          </div>
        </div>
      </div>
      <header className="commerce-header marketplace-commerce-header">
        <div className="commerce-header-main">
          <button className="mobile-menu-button" type="button" aria-label="Toggle marketplace menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button>
          <Link className="commerce-logo" href="/" aria-label="BJ Electronics home"><BrandLogo /></Link>
          <form className="header-search marketplace-header-search" onSubmit={submitSearch} role="search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands and categories…" aria-label="Search products" />
            <select aria-label="Search category" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <button type="submit" aria-label="Submit search">Search</button>
          </form>
          <nav className="commerce-actions" aria-label="Marketplace actions">
            <Link href="/wishlist" className="header-action"><span aria-hidden="true">♡</span><small>Wishlist</small>{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
            <Link href="/cart" className="header-action"><span aria-hidden="true">🛒</span><small>Cart</small>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
            <a href={adminUrl} className="header-action"><span aria-hidden="true">♙</span><small>Account</small></a>
          </nav>
        </div>
        <nav className={`category-nav marketplace-category-nav${menuOpen ? " open" : ""}`} aria-label="Product categories">
          <div className="category-nav-inner">
            <Link className="all-category-link" href="/categories" onClick={() => setMenuOpen(false)}>☰ Browse Categories</Link>
            {categories.map((category) => <Link key={category} href={`/categories?category=${encodeURIComponent(category)}`} onClick={() => setMenuOpen(false)}>{category}</Link>)}
            <Link className="nav-deal" href="/categories?sort=discount" onClick={() => setMenuOpen(false)}>Deals</Link>
          </div>
        </nav>
        <nav className={`marketplace-mobile-drawer${menuOpen ? " open" : ""}`} aria-label="Mobile marketplace links">
          <Link href="/categories" onClick={() => setMenuOpen(false)}>All products</Link>
          <Link href="/categories?sort=newest" onClick={() => setMenuOpen(false)}>New arrivals</Link>
          <Link href="/categories?sort=discount" onClick={() => setMenuOpen(false)}>Current deals</Link>
          <Link href="/track-order" onClick={() => setMenuOpen(false)}>Track an order</Link>
          <a href="mailto:support@bjelectronics.shop" onClick={() => setMenuOpen(false)}>Customer support</a>
        </nav>
      </header>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/"><span>⌂</span>Home</Link>
        <Link href="/categories"><span>▦</span>Categories</Link>
        <Link href="/cart" className="mobile-cart-link"><span>🛒</span>Cart{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
        <Link href="/wishlist"><span>♡</span>Wishlist</Link>
      </nav>
    </>
  );
}
