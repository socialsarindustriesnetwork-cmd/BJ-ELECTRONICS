"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import type { Product, ProductStatus } from "@bje/database";
import { BrandLogo } from "@bje/ui";

const emptyForm = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  price: "",
  compareAt: "",
  inventoryQuantity: "0",
  status: "DRAFT" as ProductStatus,
  imageUrl: "",
  version: undefined as number | undefined,
};

type FormState = typeof emptyForm;

type ApiPayload = {
  error?: string;
  product?: Product;
  products?: Product[];
};

function money(product: Product): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency }).format(product.priceCents / 100);
}

function formFromProduct(product: Product): FormState {
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: (product.priceCents / 100).toFixed(2),
    compareAt: product.compareAtCents === null ? "" : (product.compareAtCents / 100).toFixed(2),
    inventoryQuantity: String(product.inventoryQuantity),
    status: product.status,
    imageUrl: product.imageUrl ?? "",
    version: product.version,
  };
}

export function ProductManager({ initialProducts, storeUrl }: { initialProducts: Product[]; storeUrl: string }) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      `${product.name} ${product.sku} ${product.slug}`.toLowerCase().includes(normalized),
    );
  }, [products, query]);

  function change<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
  }

  function edit(product: Product) {
    setEditingId(product.id);
    setForm(formFromProduct(product));
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function reload() {
    const response = await fetch("/api/products", { cache: "no-store" });
    const payload = (await response.json()) as ApiPayload;
    if (payload.products) setProducts(payload.products);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setMessage(null);
    const price = Number(form.price);
    const compareAt = form.compareAt.trim() ? Number(form.compareAt) : null;
    const inventoryQuantity = Number(form.inventoryQuantity);
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(inventoryQuantity) || inventoryQuantity < 0) {
      setMessage({ type: "error", text: "Enter a valid price and non-negative whole-number inventory quantity." });
      setWorking(false);
      return;
    }

    const body = {
      name: form.name,
      slug: form.slug || undefined,
      sku: form.sku,
      description: form.description,
      priceCents: Math.round(price * 100),
      compareAtCents: compareAt === null ? null : Math.round(compareAt * 100),
      currency: "USD",
      inventoryQuantity,
      status: form.status,
      imageUrl: form.imageUrl || null,
      expectedVersion: form.version,
    };

    try {
      const response = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as ApiPayload;
      if (!response.ok) {
        setMessage({ type: "error", text: payload.error ?? "The product could not be saved." });
        return;
      }
      await reload();
      setMessage({ type: "success", text: editingId ? "Product updated and synchronized." : "Product created and synchronized." });
      setEditingId(null);
      setForm(emptyForm);
    } catch {
      setMessage({ type: "error", text: "The product service could not be reached." });
    } finally {
      setWorking(false);
    }
  }

  async function archive(product: Product) {
    if (!window.confirm(`Archive ${product.name}? It will be removed from the public store.`)) return;
    setWorking(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => ({}))) as ApiPayload;
      if (!response.ok) {
        setMessage({ type: "error", text: payload.error ?? "The product could not be archived." });
        return;
      }
      await reload();
      if (editingId === product.id) reset();
      setMessage({ type: "success", text: "Product archived and removed from the live storefront." });
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="manager-layout">
      <header className="manager-header">
        <Link href="/" aria-label="BJ Electronics admin home"><BrandLogo /></Link>
        <div className="manager-header-actions">
          <Link className="admin-secondary" href="/">Dashboard</Link>
          <a className="admin-primary" href={storeUrl} target="_blank" rel="noreferrer">Open live store ↗</a>
        </div>
      </header>

      <main className="manager-main">
        <section className="manager-heading">
          <div><p className="eyebrow">Catalog operations</p><h1>Products & inventory</h1><p>Every successful mutation publishes a durable storefront synchronization event.</p></div>
          <button className="admin-secondary" type="button" onClick={reset}>New product</button>
        </section>

        <div className="manager-grid">
          <section className="product-list">
            <div className="list-toolbar">
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products and SKUs" />
              <span className="sync-badge">{products.length} records</span>
            </div>
            {visibleProducts.map((product) => (
              <div className="product-row" key={product.id}>
                <div className="product-row-name"><strong>{product.name}</strong><small>{product.sku} · /{product.slug}</small></div>
                <span className={`status-pill ${product.status.toLowerCase()}`}>{product.status}</span>
                <strong>{money(product)}</strong>
                <span className={product.inventoryQuantity <= 5 ? "stock-low" : "stock-ok"}>{product.inventoryQuantity} units</span>
                <div className="row-actions">
                  <button className="row-button" type="button" onClick={() => edit(product)}>Edit</button>
                  {product.status !== "ARCHIVED" && <button className="row-button danger" type="button" onClick={() => archive(product)} disabled={working}>Archive</button>}
                </div>
              </div>
            ))}
            {!visibleProducts.length && <div className="empty-state">No products match this search.</div>}
          </section>

          <aside className="product-form-card">
            <h2>{editingId ? "Edit product" : "Create product"}</h2>
            <p>{editingId ? "Optimistic version checks prevent overwriting changes from another administration session." : "Create a draft or publish directly to the live storefront."}</p>
            {message && <div className={message.type === "error" ? "form-error" : "form-success"}>{message.text}</div>}
            <form className="product-form" onSubmit={submit}>
              <label className="form-field"><span>Product name</span><input value={form.name} onChange={(event) => change("name", event.target.value)} required maxLength={180} /></label>
              <div className="form-columns">
                <label className="form-field"><span>SKU</span><input value={form.sku} onChange={(event) => change("sku", event.target.value)} required maxLength={80} /></label>
                <label className="form-field"><span>Status</span><select value={form.status} onChange={(event) => change("status", event.target.value as ProductStatus)}><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option></select></label>
              </div>
              <label className="form-field"><span>URL slug</span><input value={form.slug} onChange={(event) => change("slug", event.target.value)} placeholder="Generated from product name" maxLength={140} /></label>
              <label className="form-field"><span>Description</span><textarea value={form.description} onChange={(event) => change("description", event.target.value)} maxLength={5000} /></label>
              <div className="form-columns">
                <label className="form-field"><span>Price (USD)</span><input type="number" min="0" step="0.01" value={form.price} onChange={(event) => change("price", event.target.value)} required /></label>
                <label className="form-field"><span>Compare at</span><input type="number" min="0" step="0.01" value={form.compareAt} onChange={(event) => change("compareAt", event.target.value)} /></label>
              </div>
              <div className="form-columns">
                <label className="form-field"><span>Inventory</span><input type="number" min="0" step="1" value={form.inventoryQuantity} onChange={(event) => change("inventoryQuantity", event.target.value)} required /></label>
                <label className="form-field"><span>Image URL</span><input type="url" value={form.imageUrl} onChange={(event) => change("imageUrl", event.target.value)} placeholder="https://" /></label>
              </div>
              <div className="form-actions">
                {editingId && <button className="admin-secondary" type="button" onClick={reset}>Cancel</button>}
                <button className="admin-primary" type="submit" disabled={working}>{working ? "Saving…" : editingId ? "Save changes" : "Create product"}</button>
              </div>
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
}
