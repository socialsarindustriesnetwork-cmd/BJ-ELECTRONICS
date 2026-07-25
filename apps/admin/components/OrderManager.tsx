"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CommerceOrder, OrderStatus } from "@bje/database/transactions";
import { BrandLogo } from "@bje/ui";

const statusOptions: Array<"ALL" | OrderStatus> = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const nextStatuses: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function date(value: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function OrderManager({
  initialOrders,
  storeUrl,
}: {
  initialOrders: CommerceOrder[];
  storeUrl: string;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [query, setQuery] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const visibleOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = filter === "ALL" || order.status === filter;
      const matchesQuery = !normalized || `${order.orderNumber} ${order.customerName} ${order.customerEmail} ${order.customerPhone}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [filter, orders, query]);

  const summary = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => ["PENDING", "CONFIRMED"].includes(order.status)).length,
    fulfillment: orders.filter((order) => ["PROCESSING", "SHIPPED"].includes(order.status)).length,
    value: orders.filter((order) => order.status !== "CANCELLED").reduce((total, order) => total + order.totalCents, 0),
  }), [orders]);

  async function reload() {
    const response = await fetch("/api/orders", { cache: "no-store" });
    const payload = await response.json() as { orders?: CommerceOrder[]; error?: string };
    if (!response.ok || !payload.orders) throw new Error(payload.error || "Could not reload orders.");
    setOrders(payload.orders);
  }

  async function move(order: CommerceOrder, status: OrderStatus) {
    const destructive = status === "CANCELLED";
    if (destructive && !window.confirm(`Cancel ${order.orderNumber}? Reserved inventory will be returned to stock.`)) return;
    setWorkingId(order.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json() as { order?: CommerceOrder; error?: string };
      if (!response.ok || !payload.order) throw new Error(payload.error || "The order could not be updated.");
      await reload();
      setMessage({ type: "success", text: `${order.orderNumber} moved to ${status.toLowerCase()}.` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "The order could not be updated." });
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="manager-layout">
      <header className="manager-header">
        <Link href="/" aria-label="BJ Electronics admin home"><BrandLogo /></Link>
        <div className="manager-header-actions">
          <Link className="admin-secondary" href="/">Dashboard</Link>
          <Link className="admin-secondary" href="/products">Products</Link>
          <a className="admin-primary" href={storeUrl} target="_blank" rel="noreferrer">Open live store ↗</a>
        </div>
      </header>

      <main className="manager-main orders-main">
        <section className="manager-heading">
          <div><p className="eyebrow">Transactional operations</p><h1>Orders & fulfilment</h1><p>Review customer orders, confirm payment handling, progress fulfilment, and release stock safely when an order is cancelled.</p></div>
        </section>

        <section className="order-metric-grid">
          <article><span>Total orders</span><strong>{summary.total}</strong><small>All transactional records</small></article>
          <article><span>Awaiting action</span><strong>{summary.pending}</strong><small>Pending or confirmed</small></article>
          <article><span>In fulfilment</span><strong>{summary.fulfillment}</strong><small>Processing or shipped</small></article>
          <article><span>Gross order value</span><strong>{money(summary.value, orders[0]?.currency ?? "USD")}</strong><small>Excludes cancelled orders</small></article>
        </section>

        <section className="orders-card">
          <div className="orders-toolbar">
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, email, or phone" />
            <select value={filter} onChange={(event) => setFilter(event.target.value as "ALL" | OrderStatus)}>
              {statusOptions.map((status) => <option key={status} value={status}>{status === "ALL" ? "All statuses" : status}</option>)}
            </select>
            <span className="sync-badge">{visibleOrders.length} shown</span>
          </div>
          {message ? <div className={message.type === "error" ? "form-error" : "form-success"}>{message.text}</div> : null}

          <div className="orders-table-wrap">
            <table className="admin-table orders-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Created</th><th>Payment</th><th>Status</th><th>Total</th><th>Next action</th></tr></thead>
              <tbody>
                {visibleOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.orderNumber}</strong><small>{order.itemCount} item{order.itemCount === 1 ? "" : "s"}</small></td>
                    <td><strong>{order.customerName}</strong><small>{order.customerEmail}<br />{order.customerPhone}<br />{order.city}, {order.country}</small></td>
                    <td>{date(order.createdAt)}</td>
                    <td><span>{order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on delivery" : "Bank transfer"}</span><small>{order.paymentStatus}</small></td>
                    <td><span className={`status-pill order-${order.status.toLowerCase()}`}>{order.status}</span></td>
                    <td><strong>{money(order.totalCents, order.currency)}</strong><small>Shipping {order.shippingCents ? money(order.shippingCents, order.currency) : "Free"}</small></td>
                    <td>
                      {nextStatuses[order.status].length ? (
                        <div className="order-actions">
                          {nextStatuses[order.status].map((status) => (
                            <button key={status} className={status === "CANCELLED" ? "row-button danger" : "row-button"} type="button" disabled={workingId === order.id} onClick={() => move(order, status)}>
                              {workingId === order.id ? "Updating…" : status}
                            </button>
                          ))}
                        </div>
                      ) : <span className="terminal-order">No further action</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visibleOrders.length ? <div className="empty-state">No orders match the selected filters.</div> : null}
        </section>
      </main>
    </div>
  );
}
