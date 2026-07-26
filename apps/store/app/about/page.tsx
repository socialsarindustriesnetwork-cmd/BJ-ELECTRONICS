import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "About us",
  description: "Learn about BJ Electronics, our service principles and our commitment to dependable technology.",
};

export default function AboutPage() {
  return (
    <StaticPageShell
      eyebrow="About BJ Electronics"
      title="Technology selected with trust, quality and practical service in mind."
      description="BJ Electronics is building a dependable online destination for computing, audio, wearables, displays, power and everyday electronic accessories."
    >
      <section className="static-page-grid">
        <article className="static-info-card"><b>01</b><h2>Reliable products</h2><p>We focus on useful technology, transparent product information and catalog controls that keep availability and pricing coordinated.</p></article>
        <article className="static-info-card"><b>02</b><h2>Customer-focused service</h2><p>Our support approach prioritizes clear communication around orders, delivery, warranty coverage, returns and product selection.</p></article>
        <article className="static-info-card"><b>03</b><h2>Secure commerce</h2><p>The storefront validates inventory and price during checkout while the administration application controls products and operations.</p></article>
      </section>
      <section className="static-copy-block">
        <h2>Smart tech, better life.</h2>
        <p>Our brand promise is straightforward: make dependable electronics easier to discover, compare and order. BJ Electronics combines a responsive shopping experience with controlled operational workflows so the customer-facing store and the internal business system remain synchronized.</p>
      </section>
    </StaticPageShell>
  );
}
