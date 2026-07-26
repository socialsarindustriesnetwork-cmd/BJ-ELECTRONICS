"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@bje/database";
import { ProductCard } from "@/components/ProductCard";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { marketplaceCategories, marketplaceCategoryLabel, productBrand } from "@/lib/marketplace";

export function CatalogListingClient({ products, adminUrl }: { products: Product[]; adminUrl: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All products");
  const [brand, setBrand] = useState("All brands");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    const requestedQuery = params.get("q");
    const requestedSort = params.get("sort");
    const requestedBrand = params.get("brand");
    if (requestedCategory) setCategory(requestedCategory);
    if (requestedQuery) setQuery(requestedQuery);
    if (requestedBrand) setBrand(requestedBrand);
    if (requestedSort === "newest" || requestedSort === "discount") setSort(requestedSort);
  }, []);

  const categories = useMemo(() => ["All products", ...marketplaceCategories.map((item) => item.label)], []);
  const brands = useMemo(() => ["All brands", ...Array.from(new Set(products.map(productBrand))).sort()], [products]);
  const highestPrice = useMemo(() => Math.max(500, ...products.map((product) => Math.ceil(product.priceCents / 100 / 100) * 100)), [products]);
  useEffect(() => setMaxPrice(highestPrice), [highestPrice]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesQuery = !normalized || `${product.name} ${product.description} ${product.sku}`.toLowerCase().includes(normalized);
      const matchesCategory = category === "All products" || marketplaceCategoryLabel(product) === category;
      const matchesBrand = brand === "All brands" || productBrand(product) === brand;
      const matchesAvailability = availability === "all" || (availability === "in" ? product.inventoryQuantity > 0 : product.inventoryQuantity < 1);
      return matchesQuery && matchesCategory && matchesBrand && matchesAvailability && product.priceCents / 100 <= maxPrice;
    });
    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.priceCents - b.priceCents;
      if (sort === "price-high") return b.priceCents - a.priceCents;
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "discount") return ((b.compareAtCents ?? b.priceCents) - b.priceCents) - ((a.compareAtCents ?? a.priceCents) - a.priceCents);
      return a.name.localeCompare(b.name);
    });
  }, [availability, brand, category, maxPrice, products, query, sort]);

  function clearFilters() { setQuery(""); setCategory("All products"); setBrand("All brands"); setAvailability("all"); setSort("featured"); setMaxPrice(highestPrice); }

  return (
    <div className="store-shell marketplace-listing-shell">
      <StoreHeader adminUrl={adminUrl} />
      <main className="marketplace-listing-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><span>Shop</span>{category !== "All products" ? <><span>›</span><strong>{category}</strong></> : null}</nav>
        <section className="listing-campaign-banner"><div><span>Complete electronics marketplace</span><h1>{category === "All products" ? "Shop all products" : category}</h1><p>Compare specifications, prices and live availability across BJ Electronics.</p></div><div className="listing-campaign-art"><i /><i /><strong>BJ</strong></div></section>
        <button className="mobile-filter-trigger" type="button" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}>☰ {filtersOpen ? "Hide filters" : "Show filters"}</button>
        <div className="listing-layout market-listing-layout">
          <aside className={`catalog-filters market-filters${filtersOpen ? " open" : ""}`}>
            <div className="filter-title"><strong>Filter products</strong><button type="button" onClick={clearFilters}>Reset</button></div>
            <label className="filter-search"><span>Search within results</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Product name or model" /></label>
            <fieldset><legend>Department</legend>{categories.map((item) => <label key={item}><input type="radio" name="category" checked={category === item} onChange={() => setCategory(item)} /><span>{item}</span><small>{item === "All products" ? products.length : products.filter((product) => marketplaceCategoryLabel(product) === item).length}</small></label>)}</fieldset>
            <fieldset><legend>Brand</legend><select value={brand} onChange={(event) => setBrand(event.target.value)}>{brands.map((item) => <option key={item}>{item}</option>)}</select></fieldset>
            <fieldset><legend>Price range</legend><input className="price-range" type="range" min="0" max={highestPrice} step="25" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><div className="range-labels"><span>৳0</span><strong>Up to {new Intl.NumberFormat("en-BD").format(maxPrice)}</strong></div></fieldset>
            <fieldset><legend>Availability</legend><label><input type="radio" name="availability" checked={availability === "all"} onChange={() => setAvailability("all")} /><span>All inventory</span></label><label><input type="radio" name="availability" checked={availability === "in"} onChange={() => setAvailability("in")} /><span>In stock</span></label><label><input type="radio" name="availability" checked={availability === "out"} onChange={() => setAvailability("out")} /><span>Out of stock</span></label></fieldset>
            <div className="filter-support-card"><span>Need buying advice?</span><strong>Talk to our electronics team.</strong><Link href="/contact">Contact support →</Link></div>
          </aside>
          <section className="listing-results marketplace-results">
            <div className="listing-heading"><div><span>BJ Electronics marketplace</span><h2>{category === "All products" ? "All electronics and appliances" : category}</h2><p>Showing {filtered.length} of {products.length} available products</p></div><div className="listing-controls"><label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="discount">Biggest discount</option></select></label><div className="view-toggle"><button className={view === "grid" ? "active" : ""} type="button" onClick={() => setView("grid")} aria-label="Grid view">▦</button><button className={view === "list" ? "active" : ""} type="button" onClick={() => setView("list")} aria-label="List view">☷</button></div></div></div>
            {filtered.length ? <div className={`listing-product-grid marketplace-product-results ${view}`}>{filtered.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="empty-state"><strong>No products match these filters.</strong><p>Try another department, brand or price range.</p><button type="button" onClick={clearFilters}>Reset filters</button></div>}
          </section>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
