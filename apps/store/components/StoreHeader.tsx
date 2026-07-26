"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommerceCart } from "@bje/database/transactions";
import { BrandLogo } from "@bje/ui";

const categories = [
  "Laptops",
  "Earphones",
  "Headphones",
  "Smart Watches",
  "Speakers",
  "Accessories",
  "Monitors",
  "Power Banks",
];

const departmentGroups = [
  { title: "Computing", items: ["Laptops", "Monitors", "Accessories"] },
  { title: "Audio", items: ["Earphones", "Headphones", "Speakers"] },
  { title: "Smart lifestyle", items: ["Smart Watches", "Power Banks", "Accessories"] },
];

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
    router.push(suffix ? `/categories?${suffix}` : "/categories");
    setMenuOpen(false);
  }

  return (
    <>
      <div className="utility-bar">
        <div className="utility-inner marketplace-utility">
          <div className="utility-promise"><span>🚚 Countrywide delivery</span><span>✓ Official warranty support</span></div>
          <div className="utility-links"><a href="mailto:support@bjelectronics.shop">Help center</a><a href="tel:+8800000000000">Sales support</a><a href={adminUrl}>Admin portal</a></div>
        </div>
      </div>

      <div className="marketplace-announcement">
        <div><strong>Smart tech, better life.</strong><span>Shop dependable electronics with live inventory and secure checkout.</span></div>
        <Link href="/categories?sort=discount">Explore current deals →</Link>
      </div>

      <header className="commerce-header marketplace-header">
        <div className="commerce-header-main">
          <button className="mobile-menu-button" type="button" aria-label="Toggle departments" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button>
          <Link className="commerce-logo" href="/" aria-label="BJ Electronics home"><BrandLogo /></Link>

          <form className="header-search marketplace-search" onSubmit={submitSearch} role="search">
            <select aria-label="Search category" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All departments</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands and categories…" aria-label="Search products" />
            <button type="submit" aria-label="Submit search">⌕</button>
          </form>

          <nav className="commerce-actions" aria-label="Account actions">
            <a href={adminUrl} className="header-action account-action"><span aria-hidden="true">♙</span><small><b>Account</b>Sign in</small></a>
            <Link href="/wishlist" className="header-action"><span aria-hidden="true">♡</span><small><b>Wishlist</b>Saved</small>{wishlistCount > 0 ? <i>{wishlistCount}</i> : null}</Link>
            <Link href="/cart" className="header-action"><span aria-hidden="true">🛒</span><small><b>Cart</b>Checkout</small>{cartCount > 0 ? <i>{cartCount}</i> : null}</Link>
          </nav>
        </div>

        <nav className="category-nav marketplace-category-nav" aria-label="Product categories">
          <div className="category-nav-inner">
            <button className="all-category-link" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰ Shop all departments <span>⌄</span></button>
            <Link href="/categories?sort=newest">New arrivals</Link>
            <Link href="/categories?sort=popular">Best sellers</Link>
            <Link href="/categories?category=Laptops">Computing</Link>
            <Link href="/categories?category=Headphones">Audio</Link>
            <Link href="/categories?category=Smart%20Watches">Wearables</Link>
            <Link href="/categories?category=Accessories">Accessories</Link>
            <Link className="nav-deal" href="/categories?sort=discount">Deals</Link>
            <a className="business-nav-link" href="mailto:sales@bjelectronics.shop?subject=Business%20sales">Business sales</a>
          </div>
        </nav>

        {menuOpen ? (
          <div className="mega-menu-shell">
            <div className="mega-menu" role="dialog" aria-label="Shop departments">
              <div className="mega-menu-intro"><span>Shop the complete store</span><h2>Find the right technology faster.</h2><p>Browse focused departments, featured deals and essential services.</p><Link href="/categories" onClick={() => setMenuOpen(false)}>View all products</Link></div>
              {departmentGroups.map((group) => (
                <section key={group.title}><h3>{group.title}</h3>{group.items.map((item) => <Link key={item} href={`/categories?category=${encodeURIComponent(item)}`} onClick={() => setMenuOpen(false)}>{item}<span>→</span></Link>)}</section>
              ))}
              <aside><strong>Need buying advice?</strong><p>Our team can help with product selection, business orders and after-sales questions.</p><a href="mailto:support@bjelectronics.shop">Talk to support</a></aside>
            </div>
          </div>
        ) : null}
      </header>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/"><span>⌂</span>Home</Link>
        <Link href="/categories"><span>▦</span>Categories</Link>
        <Link href="/wishlist"><span>♡</span>Wishlist{wishlistCount > 0 ? <b>{wishlistCount}</b> : null}</Link>
        <Link href="/cart" className="mobile-cart-link"><span>🛒</span>Cart{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>
        <a href={adminUrl}><span>♙</span>Account</a>
      </nav>
    </>
  );
}
