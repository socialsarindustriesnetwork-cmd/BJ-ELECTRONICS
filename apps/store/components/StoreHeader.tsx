"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommerceCart } from "@bje/database/transactions";
import { BrandLogo } from "@bje/ui";
import { marketplaceCategories } from "@/lib/marketplace";

export function StoreHeader({ adminUrl }: { adminUrl: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
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
    const params = new URLSearchParams();
    const normalized = query.trim();
    if (normalized) params.set("q", normalized);
    if (searchCategory !== "all") params.set("category", searchCategory);
    router.push(`/categories${params.size ? `?${params.toString()}` : ""}`);
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
            <span>Nationwide delivery across Bangladesh</span>
          </div>
          <div className="utility-links">
            <Link href="/shipping-returns">Shipping & returns</Link>
            <Link href="/contact">Customer care</Link>
            <a href={adminUrl}>Administration</a>
          </div>
        </div>
      </div>

      <header className="commerce-header caravan-header full-market-header">
        <div className="commerce-header-main">
          <button className="mobile-menu-button" type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button>
          <Link className="commerce-logo" href="/" aria-label="BJ Electronics home"><BrandLogo /></Link>

          <form className="header-search caravan-search full-market-search" onSubmit={submitSearch} role="search">
            <select value={searchCategory} onChange={(event) => setSearchCategory(event.target.value)} aria-label="Search department">
              <option value="all">All departments</option>
              {marketplaceCategories.map((category) => <option key={category.key} value={category.label}>{category.short}</option>)}
            </select>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search televisions, refrigerators, phones and more…" aria-label="Search products" />
            <button type="submit" aria-label="Submit search">⌕</button>
          </form>

          <nav className="commerce-actions" aria-label="Account actions">
            <Link href="/wishlist" className="header-action"><span aria-hidden="true">♡</span><small>Wishlist</small>{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
            <Link href="/cart" className="header-action caravan-cart-action"><span aria-hidden="true">🛒</span><small>{cartCount} item{cartCount === 1 ? "" : "s"}</small><em>{formattedCartTotal}</em>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
            <a href={adminUrl} className="header-action"><span aria-hidden="true">♙</span><small>Account</small></a>
          </nav>
        </div>

        <nav className={`primary-store-nav${menuOpen ? " open" : ""}`} aria-label="Primary store navigation">
          <div className="primary-store-nav-inner">
            <Link href="/">Home</Link>
            <Link href="/categories">All products</Link>
            <Link href="/categories?sort=newest">New arrivals</Link>
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact us</Link>
            <Link className="primary-nav-deal" href="/categories?sort=discount">Special offers</Link>
          </div>
        </nav>

        <nav className={`category-nav caravan-category-nav full-category-nav${menuOpen ? " open" : ""}`} aria-label="Product departments">
          <div className="category-nav-inner">
            <Link className="all-category-link" href="/categories">☰ Shop by department</Link>
            {marketplaceCategories.map((category) => <Link key={category.key} href={`/categories?category=${encodeURIComponent(category.label)}`}>{category.short}</Link>)}
          </div>
        </nav>
      </header>

      <nav className="mobile-bottom-nav full-mobile-nav" aria-label="Mobile navigation">
        <Link href="/"><span>⌂</span>Home</Link>
        <Link href="/categories"><span>▦</span>Shop</Link>
        <Link href="/wishlist"><span>♡</span>Wishlist{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
        <Link href="/cart" className="mobile-cart-link"><span>🛒</span>Cart{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
        <Link href="/contact"><span>✉</span>Support</Link>
      </nav>
    </>
  );
}
