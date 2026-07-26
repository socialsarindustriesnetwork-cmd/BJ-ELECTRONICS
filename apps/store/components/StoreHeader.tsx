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
  const [wishlistCount, setWishlistCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);

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
    if (searchCategory !== "all") params.set("category", searchCategory);
    router.push(`/categories${params.size ? `?${params.toString()}` : ""}`);
    setMenuOpen(false);
  }

  return (
    <>
      <div className="market-announcement">
        <div className="market-announcement-inner">
          <span><b>Nationwide delivery</b> across Bangladesh</span>
          <div><span>Secure checkout</span><a href="mailto:support@bjelectronics.shop?subject=Order%20support">Order support</a><a href="mailto:support@bjelectronics.shop">Customer care</a><a href={adminUrl}>Admin portal</a></div>
        </div>
      </div>
      <header className="market-header">
        <div className="market-header-main">
          <button className="mobile-menu-button market-mobile-menu" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button>
          <Link className="commerce-logo" href="/" aria-label="BJ Electronics home"><BrandLogo /></Link>
          <form className="market-search" onSubmit={submitSearch} role="search">
            <select value={searchCategory} onChange={(event) => setSearchCategory(event.target.value)} aria-label="Search department">
              <option value="all">All departments</option>
              {marketplaceCategories.map((category) => <option key={category.key} value={category.label}>{category.short}</option>)}
            </select>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search televisions, refrigerators, phones and more" aria-label="Search products" />
            <button type="submit" aria-label="Submit search">⌕</button>
          </form>
          <div className="market-help"><span>Need help?</span><a href="mailto:support@bjelectronics.shop"><strong>Talk to an expert</strong></a></div>
          <nav className="market-actions" aria-label="Shopping actions">
            <Link href="/wishlist" className="market-action"><span aria-hidden="true">♡</span><small>Wishlist</small>{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
            <Link href="/cart" className="market-action"><span aria-hidden="true">🛒</span><small>Cart</small>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
            <a href={adminUrl} className="market-action"><span aria-hidden="true">♙</span><small>Account</small></a>
          </nav>
        </div>
        <nav className={`market-nav${menuOpen ? " open" : ""}`} aria-label="Store departments">
          <div className="market-nav-inner">
            <div className="department-menu">
              <button type="button" aria-expanded={departmentsOpen} onClick={() => setDepartmentsOpen((value) => !value)}>☰ Shop by department <span>⌄</span></button>
              <div className={`department-panel${departmentsOpen ? " open" : ""}`}>
                {marketplaceCategories.map((category) => (
                  <Link href={`/categories?category=${encodeURIComponent(category.label)}`} key={category.key} onClick={() => { setDepartmentsOpen(false); setMenuOpen(false); }}>
                    <span>{category.icon}</span><div><strong>{category.label}</strong><small>{category.description}</small></div><i>›</i>
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/">Home</Link>
            <Link href="/categories?category=TV%20%26%20Entertainment">TV & Entertainment</Link>
            <Link href="/categories?category=Refrigerators%20%26%20Freezers">Refrigerators</Link>
            <Link href="/categories?category=Air%20Conditioners">Air Conditioners</Link>
            <Link href="/categories?category=Washing%20Machines">Washing Machines</Link>
            <Link href="/categories?category=Kitchen%20Appliances">Kitchen</Link>
            <Link href="/categories?category=Laptops%20%26%20Computing">Computing</Link>
            <Link className="nav-deal" href="/categories?sort=discount">Hot deals</Link>
          </div>
        </nav>
      </header>
      <nav className="mobile-bottom-nav market-mobile-bottom" aria-label="Mobile navigation">
        <Link href="/"><span>⌂</span>Home</Link>
        <Link href="/categories"><span>▦</span>Categories</Link>
        <Link href="/wishlist"><span>♡</span>Wishlist{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
        <Link href="/cart" className="mobile-cart-link"><span>🛒</span>Cart{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
        <a href={adminUrl}><span>♙</span>Account</a>
      </nav>
    </>
  );
}
