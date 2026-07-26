import type { Metadata } from "next";
import { StoreContentPage } from "@/components/StoreContentPage";

export const metadata: Metadata = {
  title: "About us",
  description: "Learn how BJ Electronics combines dependable products, controlled inventory and responsive support for customers across Bangladesh.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <StoreContentPage
      eyebrow="About BJ Electronics"
      title="A dependable electronics store built around trust."
      intro="BJ Electronics brings together curated technology, controlled product information, live inventory and a transaction-focused shopping experience for customers across Bangladesh."
    >
      <div className="caravan-content-grid">
        <article className="caravan-content-card"><h2>Our mission</h2><p>Make reliable technology easier to discover and purchase through clear information, responsive support and dependable fulfilment.</p></article>
        <article className="caravan-content-card"><h2>Quality first</h2><p>Only products approved through the BJ Electronics administration system can be published to the storefront. Pricing and availability remain connected to the operational catalog.</p></article>
        <article className="caravan-content-card"><h2>Customer confidence</h2><p>Cart totals and inventory are validated again during checkout so an order is created from current product data rather than a stale page.</p></article>
        <article className="caravan-content-card"><h2>Responsive service</h2><p>Questions before purchase, delivery concerns and after-sales requests are handled through the store support channel with the order context kept available to the operations team.</p></article>
      </div>
    </StoreContentPage>
  );
}