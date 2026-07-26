import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Shipping and returns",
  description: "BJ Electronics delivery, return and warranty support information.",
};

export default function ShippingReturnsPage() {
  return (
    <StaticPageShell
      eyebrow="Customer service"
      title="Clear delivery, return and warranty assistance."
      description="The information below describes the standard BJ Electronics service workflow. Order-specific timelines and eligibility are confirmed by the support team."
    >
      <section className="static-page-grid">
        <article className="static-info-card"><b>Delivery</b><h2>Order coordination</h2><p>Available items are reserved when an order is accepted. Delivery timing depends on destination, product type and fulfilment readiness.</p></article>
        <article className="static-info-card"><b>Returns</b><h2>Request assistance promptly</h2><p>Contact support with the order number, product condition and issue details. Eligibility depends on the product and the circumstances of the request.</p></article>
        <article className="static-info-card"><b>Warranty</b><h2>Coverage guidance</h2><p>Where applicable, the team will explain official manufacturer or seller warranty procedures and the supporting documents required.</p></article>
      </section>
      <section className="static-copy-block">
        <h2>Before returning a product</h2>
        <p>Keep the original packaging, accessories, serial labels, invoice and delivery materials. Do not send an item without receiving return instructions from BJ Electronics support. This prevents routing errors and helps the team assess the request accurately.</p>
      </section>
    </StaticPageShell>
  );
}
