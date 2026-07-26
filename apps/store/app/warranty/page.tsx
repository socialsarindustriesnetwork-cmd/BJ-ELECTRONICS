import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = {
  title: "Warranty information",
  description: "Warranty guidance for products purchased from BJ Electronics.",
};

const sections = [
  ["Coverage", "Warranty coverage depends on the product, brand, distributor and supplier terms. The product page, invoice or support confirmation should be used to determine the applicable coverage."],
  ["Proof of purchase", "Keep the BJ Electronics order reference, invoice and serial information. These details may be required before warranty support can be assessed or forwarded to an authorised service provider."],
  ["What is usually excluded", "Physical damage, liquid exposure, misuse, unauthorised repair, altered serial numbers, consumable wear and damage caused by unsuitable power or accessories may fall outside warranty coverage."],
  ["Requesting support", "Contact support@bjelectronics.shop with the order reference, product name, serial number, description of the issue and clear supporting photos or video where relevant."],
  ["Inspection and service", "A product may need inspection before repair, replacement or another remedy is approved. Service timing depends on diagnosis, parts availability and the responsible warranty provider."],
  ["Data and accessories", "Back up personal data before submitting a device for service. Remove passwords where appropriate and include only the accessories requested by the support team."],
] as const;

export default function WarrantyPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page">
        <section className="content-hero">
          <p className="eyebrow">Warranty information</p>
          <h1>Practical support for genuine product warranty claims.</h1>
          <p>Warranty terms vary by product and provider. This guidance explains how to prepare and submit a support request.</p>
        </section>
        <section className="content-grid">
          {sections.map(([title, copy]) => <article className="content-card" key={title}><h2>{title}</h2><p>{copy}</p></article>)}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
