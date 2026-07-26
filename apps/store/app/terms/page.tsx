import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "BJ Electronics storefront terms and customer ordering conditions.",
};

export default function TermsPage() {
  return (
    <StaticPageShell
      eyebrow="Store policies"
      title="Straightforward terms for using and ordering from the store."
      description="These general terms describe the BJ Electronics storefront workflow. Final product, delivery, payment and warranty conditions are confirmed with each accepted order."
    >
      <section className="static-page-grid">
        <article className="static-info-card"><b>Catalog</b><h2>Product information</h2><p>We work to keep names, descriptions, pricing and availability accurate. Material errors may be corrected before an order is confirmed.</p></article>
        <article className="static-info-card"><b>Orders</b><h2>Acceptance and stock</h2><p>Submitting checkout creates an order request. Inventory, customer details and fulfilment requirements are validated before final acceptance.</p></article>
        <article className="static-info-card"><b>Payments</b><h2>Supported methods</h2><p>The current storefront supports cash on delivery and bank transfer. Payment instructions or confirmation requirements are communicated by the operations team.</p></article>
      </section>
      <section className="static-copy-block">
        <h2>Responsible use</h2>
        <p>Customers must provide accurate contact and delivery information and must not interfere with the storefront, attempt unauthorized access or use automated methods that degrade service. BJ Electronics may cancel requests involving suspected fraud, unavailable inventory, incorrect pricing or unsupported delivery requirements.</p>
      </section>
    </StaticPageShell>
  );
}
