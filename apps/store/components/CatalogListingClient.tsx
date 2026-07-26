"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@bje/database";
import { ProductCard } from "@/components/ProductCard";
import { inferCategory } from "@/components/ProductArtwork";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

const categoryLabels: Record<string, string> = {
  laptop: "Laptops",
  earphones: "Earphones",
  headphones: "Headphones",
  watch: "Smart Watches",
  speaker: "Speakers",
  monitor: "Monitors",
  accessory: "Accessories",
  phone: "Mobile Phones",
  electronics: "Electronics",
};

function productCategory(product: Product): string {
  return categoryLabels[inferCategory(product)] ?? "Electronics";
}

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
    if (requestedCategory) setCategory(requestedCategory);
    if (requestedQuery) setQuery(requestedQuery);
    if (["newest", "discount", "popular", "price-low", "price-high"].includes(requestedSort ?? "")) setSort(requestedSort ?? "featured");
  }, []);

  const categories = useMemo(() => ["All products", ...Array.from(new Set(products.map(productCategory))).sort()], [products]);
  const brands = useMemo(() => ["All brands", ...Array.from(new Set(products.map((product) => product.name.split(/\s+/)[0]).filter(Boolean))).sort()], [products]);
  const highestPrice = useMemo(() => Math.max(500, ...products.map((product) => Math.ceil(product.priceCents / 100 / 100) * 100)), [products]);

  useEffect(() => setMaxPrice(highestPrice), [highestPrice]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesQuery = !normalized || `${product.name} ${product.description} ${product.sku}`.toLowerCase().includes(normalized);
      const matchesCategory = category === "All products" || productCategory(product) === category;
      const matchesBrand = brand === "All brands" || product.name.startsWith(brand);
      const matchesAvailability = availability === "all" || (availability === "in" ? product.inventoryQuantity > 0 : product.inventoryQuantity < 1);
      const matchesPrice = product.priceCents / 100 <= maxPrice;
      return matchesQuery && matchesCategory && matchesBrand && matchesAvailability && matchesPrice;
    });
    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.priceCents - b.priceCents;
      if (sort === "price-high") return b.priceCents - a.priceCents;
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "discount") return (b.compareAtCents ?? b.priceCents) - b.priceCents - ((a.compareAtCents ?? a.priceCents) - a.priceCents);
      if (sort === "popular") return b.inventoryQuantity - a.inventoryQuantity;
      return a.name.localeCompare(b.name);
    });
  }, [availability, brand, category, maxPrice, products, query, sort]);

  function clearFilters() {
    setQuery("");
    setCategory("All products");
    setBrand("All brands");
    setAvailability("all");
    setSort("featured");
    setMaxPrice(highestPrice);
  }

  const selectedFilterCount = [query.length > 0, category !== "All products", brand !== "All brands", availability !== "all", maxPrice < highestPrice].filter(Boolean).length;

  return (
    <div className="store-shell listing-shell marketplace-listing-shell">
      <StoreHeader adminUrl={adminUrl} />
      <main className="listing-main marketplace-listing-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><span>Products</span>{category !== "All products" ? <><span>›</span><strong>{category}</strong></> : null}</nav>

        <section className="listing-discovery-banner">
          <div><span>Explore BJ Electronics</span><h1>{category === "All products" ? "Find the right technology" : category}</h1><p>Search live inventory, compare current prices and filter products by department, brand and availability.</p></div>
          <div className="listing-discovery-art" aria-hidden="true"><span>BJ</span><i /><b /></div>
        </section>

        <nav className="listing-category-chips" aria-label="Quick category filters">
          {categories.slice(0, 9).map((item) => <button key={item} className={category === item ? "active" : ""} type="button" onClick={() => setCategory(item)}>{item}</button>)}
        </nav>

        <button className="mobile-filter-trigger" type="button" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}>☰ Filters {selectedFilterCount ? <span>{selectedFilterCount}</span> : null}</button>

        <div className="listing-layout marketplace-listing-layout">
          <aside className={`catalog-filters marketplace-filters${filtersOpen ? " open" : ""}`}>
            <div className="filter-title"><strong>Filter products</strong><button type="button" onClick={clearFilters}>Clear all</button></div>
            <label className="filter-search"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Product name, SKU or keyword" /></label>
            <fieldset><legend>Department</legend>{categories.map((item) => <label key={item}><input type="radio" name="category" checked={category === item} onChange={() => setCategory(item)} /><span>{item}</span><small>{item === "All products" ? products.length : products.filter((product) => productCategory(product) === item).length}</small></label>)}</fieldset>
            <fieldset><legend>Brand</legend><select value={brand} onChange={(event) => setBrand(event.target.value)}>{brands.map((item) => <option key={item}>{item}</option>)}</select></fieldset>
            <fieldset><legend>Price range</legend><input className="price-range" type="range" min="0" max={highestPrice} step="25" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><div className="range-labels"><span>$0</span><strong>Up to ${maxPrice.toLocaleString("en-US")}</strong></div></fieldset>
            <fieldset><legend>Availability</legend><label><input type="radio" name="availability" checked={availability === "all"} onChange={() => setAvailability("all")} /><span>All inventory</span></label><label><input type="radio" name="availability" checked={availability === "in"} onChange={() => setAvailability("in")} /><span>In stock</span></label><label><input type="radio" name="availability" checked={availability === "out"} onChange={() => setAvailability("out")} /><span>Out of stock</span></label></fieldset>
            <div className="filter-support-card"><span>Need buying advice?</span><p>Contact our team for product selection and compatibility guidance.</p><a href="mailto:support@bjelectronics.shop?subject=Product%20guidance">Ask an expert</a></div>
          </aside>

          <section className="listing-results marketplace-listing-results">
            <div className="listing-heading marketplace-results-heading"><div><span>Live catalog</span><h2>{category === "All products" ? "All electronics" : category}</h2><p>Showing {filtered.length} of {products.length} products</p></div><div className="listing-controls"><label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="popular">Popular</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="discount">Biggest discount</option></select></label><div className="view-toggle"><button className={view === "grid" ? "active" : ""} type="button" onClick={() => setView("grid")} aria-label="Grid view">▦</button><button className={view === "list" ? "active" : ""} type="button" onClick={() => setView("list")} aria-label="List view">☷</button></div></div></div>
            {selectedFilterCount ? <div className="active-filter-summary"><span>{selectedFilterCount} active filter{selectedFilterCount === 1 ? "" : "s"}</span><button type="button" onClick={clearFilters}>Reset filters</button></div> : null}
            {filtered.length ? <div className={`listing-product-grid ${view}`}>{filtered.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="empty-state"><strong>No products match these filters.</strong><p>Try another category, price range or search term.</p><button type="button" onClick={clearFilters}>Reset filters</button></div>}
          </section>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
