"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@bje/database";
import { BrandLogo } from "@bje/ui";
import type { AuthUser } from "@/lib/auth-types";

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "BJ";
}

function roleLabel(role: AuthUser["role"]): string {
  return role.toLowerCase().split("_").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function price(product: Product): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency }).format(product.priceCents / 100);
}

const nav = [
  ["Overview", "/", "⌂"],
  ["Products & inventory", "/products", "▣"],
  ["Account security", "/admin/security", "✓"],
] as const;

export function AdminDashboard({
  user,
  products,
  summary,
  storeUrl,
}: {
  user: AuthUser;
  products: Product[];
  summary: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    inventoryUnits: number;
    latestEventId: number;
  };
  storeUrl: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try { await fetch("/api/auth/sign-out", { method: "POST" }); } finally {
      router.replace("/sign-in");
      router.refresh();
    }
  }

  return (
    <div className="admin-shell">
      {open && <button className="admin-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-logo"><BrandLogo inverse /></div>
        <div className="admin-workspace"><span className="workspace-mark">BJ</span><span><b>BJ Electronics</b><small>Commerce workspace</small></span></div>
        <nav className="admin-nav" aria-label="Administration navigation">
          <p className="admin-nav-label">Operations</p>
          {nav.map(([label, href, icon], index) => (
            <Link key={href} href={href} className={index === 0 ? "active" : ""} onClick={() => setOpen(false)}>
              <span className="admin-nav-icon">{icon}</span>{label}
            </Link>
          ))}
          <p className="admin-nav-label">Channels</p>
          <a href={storeUrl} target="_blank" rel="noreferrer"><span className="admin-nav-icon">↗</span>Open live store</a>
        </nav>
        <div className="admin-profile">
          <span className="admin-avatar">{initials(user.name)}</span>
          <span><strong>{user.name}</strong><small>{roleLabel(user.role)}</small></span>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="admin-action mobile-nav-button" type="button" onClick={() => setOpen(true)}>☰</button>
            <div><h1>Store administration</h1><p>{user.email}</p></div>
          </div>
          <div className="admin-top-actions">
            <a className="admin-action" href={storeUrl} target="_blank" rel="noreferrer">View store ↗</a>
            <button className="admin-action" type="button" onClick={signOut} disabled={signingOut}>{signingOut ? "Signing out…" : "Sign out"}</button>
          </div>
        </header>

        <main className="admin-content">
          <section className="admin-heading">
            <div><p className="eyebrow">Secure commerce command center</p><h2>Welcome back, {user.name.split(" ")[0]}.</h2><p>Manage catalog, inventory, authentication, and storefront publication from one workspace.</p></div>
            <div className="admin-heading-actions"><Link className="admin-primary" href="/products">Manage products</Link></div>
          </section>

          <section className="sync-strip">
            <span className="sync-icon">↻</span>
            <div><strong>Store synchronization is active</strong><span>Product and inventory mutations publish durable events to the storefront.</span></div>
            <span className="sync-badge">Event #{summary.latestEventId}</span>
          </section>

          <section className="metric-grid">
            <article className="metric-card"><span>Total products</span><strong>{summary.totalProducts}</strong><small>All catalog records</small></article>
            <article className="metric-card"><span>Published products</span><strong>{summary.activeProducts}</strong><small>Visible on the storefront</small></article>
            <article className="metric-card"><span>Inventory units</span><strong>{summary.inventoryUnits}</strong><small>Available across active SKUs</small></article>
            <article className="metric-card"><span>Low stock</span><strong>{summary.lowStockProducts}</strong><small>Five units or fewer</small></article>
          </section>

          <section className="admin-grid">
            <article className="admin-panel">
              <header className="panel-header"><div><h3>Recently updated products</h3><p>Live commerce database records</p></div><Link className="admin-secondary" href="/products">View all</Link></header>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>SKU</th><th>Status</th><th>Inventory</th><th>Price</th></tr></thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td><strong>{product.name}</strong></td><td>{product.sku}</td>
                        <td><span className={`status-pill ${product.status.toLowerCase()}`}>{product.status}</span></td>
                        <td>{product.inventoryQuantity}</td><td><strong>{price(product)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="admin-panel">
              <header className="panel-header"><div><h3>Operational controls</h3><p>Security and publication</p></div></header>
              <div className="attention-list">
                <Link className="attention-item" href="/products"><span className="attention-mark">▣</span><span><b>Catalog manager</b><small>Create, publish, price, and stock products.</small></span><span>→</span></Link>
                <Link className="attention-item" href="/admin/security"><span className="attention-mark">✓</span><span><b>Account security</b><small>Manage password, Google, and Facebook access.</small></span><span>→</span></Link>
                <a className="attention-item" href={storeUrl} target="_blank" rel="noreferrer"><span className="attention-mark">↗</span><span><b>Live storefront</b><small>Verify customer-facing updates immediately.</small></span><span>→</span></a>
              </div>
            </article>
          </section>
        </main>
      </section>
    </div>
  );
}
