import { notFound } from "next/navigation";
import { getAdminUrl } from "@bje/config";
import { getOrderByAccess } from "@bje/database/transactions";
import { hashCartToken } from "@/lib/cart-session";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const dynamic = "force-dynamic";

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ orderNumber }, query] = await Promise.all([params, searchParams]);
  const token = query.token ?? "";
  if (!/^[a-f0-9]{64}$/.test(token)) notFound();
  const order = await getOrderByAccess(orderNumber, hashCartToken(token));
  if (!order) notFound();

  return (
    <div className="store-shell checkout-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="order-confirmation">
        <nav className="breadcrumbs"><a href="/">Home</a><span>›</span><strong>Order {order.orderNumber}</strong></nav>
        <section className="confirmation-hero">
          <span className="confirmation-mark">✓</span>
          <p className="eyebrow">Order received</p>
          <h1>Thank you, {order.customerName.split(" ")[0]}.</h1>
          <p>Your order <strong>{order.orderNumber}</strong> is securely recorded and inventory has been reserved.</p>
        </section>
        <div className="checkout-layout">
          <section className="checkout-panel">
            <div className="panel-title"><h2>Order details</h2><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span></div>
            <div className="order-lines">{order.lines?.map((line) => <div className="order-line" key={line.id}><div><strong>{line.productName}</strong><span>{line.sku} · Quantity {line.quantity}</span></div><strong>{money(line.lineTotalCents, order.currency)}</strong></div>)}</div>
            <div className="order-totals"><div><span>Subtotal</span><strong>{money(order.subtotalCents, order.currency)}</strong></div><div><span>Shipping</span><strong>{order.shippingCents ? money(order.shippingCents, order.currency) : "Free"}</strong></div><div className="order-total"><span>Total</span><strong>{money(order.totalCents, order.currency)}</strong></div></div>
          </section>
          <aside className="checkout-summary">
            <h2>Delivery</h2>
            <p><strong>{order.customerName}</strong><br />{order.addressLine1}{order.addressLine2 ? <><br />{order.addressLine2}</> : null}<br />{order.city}{order.region ? `, ${order.region}` : ""}{order.postalCode ? ` ${order.postalCode}` : ""}<br />{order.country}</p>
            <div className="summary-divider" />
            <h3>Payment</h3>
            <p>{order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on delivery" : "Bank transfer"}<br /><span>{order.paymentStatus}</span></p>
            <div className="summary-divider" />
            <p className="secure-note">Keep this private order link to review the current status.</p>
          </aside>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
