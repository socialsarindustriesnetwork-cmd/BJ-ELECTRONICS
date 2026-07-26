import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: "BJ Electronics delivery, order support and returns information.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="full-static-page">
        <section className="full-static-hero"><span>Customer care</span><h1>Shipping and returns, explained clearly.</h1><p>Delivery timing, availability and return eligibility depend on the product, destination and order status. Contact support whenever an order needs attention.</p></section>
        <section className="full-static-grid">
          <article className="full-static-card"><h2>Delivery coverage</h2><p>BJ Electronics supports delivery across Bangladesh. Final delivery timing and any applicable charge are confirmed during order processing.</p></article>
          <article className="full-static-card"><h2>Order verification</h2><p>Inventory, price and delivery details are checked before fulfilment. The support team may contact the customer when clarification is required.</p></article>
          <article className="full-static-card"><h2>Returns assistance</h2><p>Contact support with the order number, product condition and reason for return. Eligibility is assessed against the product and fulfilment record.</p></article>
          <article className="full-static-card"><h3>Before accepting delivery</h3><ul><li>Confirm the package and product match the order.</li><li>Report visible damage promptly.</li><li>Keep packaging and order information available.</li></ul></article>
          <article className="full-static-card"><h3>Need help?</h3><p>Email <a href="mailto:support@bjelectronics.shop?subject=Shipping%20or%20return%20support">support@bjelectronics.shop</a> with the order number and a concise description of the issue.</p></article>
          <article className="full-static-card"><h3>Refund handling</h3><p>Approved refunds or order adjustments are documented by the operations team and processed through the applicable payment arrangement.</p></article>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
