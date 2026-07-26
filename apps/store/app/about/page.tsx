import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "About us",
  description: "Learn how BJ Electronics delivers dependable technology, transparent service and secure online shopping.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About BJ Electronics"
      title="Technology selected with care and supported with accountability."
      introduction="BJ Electronics is building a dependable electronics store for customers who expect clear product information, honest availability and responsive service before and after an order."
    >
      <section>
        <h2>Our purpose</h2>
        <p>We make practical technology easier to discover and buy. Every published item is managed through a controlled catalog with live inventory and a secure transactional checkout process.</p>
      </section>
      <section>
        <h2>What customers can expect</h2>
        <ul>
          <li>Clear product names, descriptions, pricing and stock status.</li>
          <li>Order totals and inventory revalidated before an order is accepted.</li>
          <li>Support for delivery, warranty questions, returns and order updates.</li>
          <li>A secure administration system separated from the public storefront.</li>
        </ul>
      </section>
      <section>
        <h2>Our operating principles</h2>
        <h3>Reliability</h3>
        <p>We prioritize products and workflows that can be supported consistently.</p>
        <h3>Transparency</h3>
        <p>Pricing, availability and order status are presented without unnecessary complexity.</p>
        <h3>Customer focus</h3>
        <p>Questions and problems are handled with direct communication and documented follow-up.</p>
      </section>
      <div className="policy-callout">BJ Electronics branding, product data and customer operations remain independent. Reference sites inform layout patterns only; their logos, product content and proprietary assets are not reused.</div>
    </InfoPage>
  );
}
