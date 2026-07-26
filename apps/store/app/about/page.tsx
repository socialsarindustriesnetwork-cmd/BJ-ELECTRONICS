import type { Metadata } from "next";
import { InfoPageShell } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "About us", description: "Learn about BJ Electronics and our approach to dependable technology retail." };

export default function AboutPage() {
  return (
    <InfoPageShell eyebrow="About BJ Electronics" title="Technology shopping built around confidence." description="BJ Electronics combines a focused electronics catalog with transparent inventory, secure order processing and responsive customer support.">
      <section><h2>Our purpose</h2><p>We help customers choose dependable technology for work, study, entertainment and everyday life. The store is designed to make product discovery, ordering and support clear from the first search through fulfilment.</p></section>
      <section className="info-value-grid"><div><strong>Reliable</strong><p>Published products and inventory come from one controlled operational source of truth.</p></div><div><strong>Customer focused</strong><p>Buying guidance and after-sales questions are handled through responsive support channels.</p></div><div><strong>Secure</strong><p>Cart, inventory and order creation use transactional validation before confirmation.</p></div><div><strong>Practical</strong><p>Our catalog focuses on useful technology and clear product information.</p></div></section>
      <section><h2>What makes the store different</h2><ul><li>Live inventory synchronization between storefront and administration.</li><li>Secure cart and checkout workflows with inventory revalidation.</li><li>Countrywide delivery coordination across Bangladesh.</li><li>Business purchasing support for coordinated requirements.</li></ul></section>
    </InfoPageShell>
  );
}
