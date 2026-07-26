import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How BJ Electronics handles customer and storefront information.",
};

export default function PrivacyPage() {
  return (
    <StaticPageShell
      eyebrow="Privacy and information"
      title="Customer information is used to operate and support the store."
      description="This summary explains the primary information flows in the BJ Electronics storefront and the operational purposes for which information is used."
    >
      <section className="static-page-grid">
        <article className="static-info-card"><b>Collected</b><h2>Order and contact details</h2><p>Checkout may collect a name, email, phone number, delivery address, order contents and customer notes required to process the request.</p></article>
        <article className="static-info-card"><b>Purpose</b><h2>Commerce operations</h2><p>Information is used to validate orders, coordinate delivery, provide support, prevent misuse and maintain business records.</p></article>
        <article className="static-info-card"><b>Control</b><h2>Support requests</h2><p>Customers may contact support to ask about their order information or request reasonable corrections to details they supplied.</p></article>
      </section>
      <section className="static-copy-block">
        <h2>Security and retention</h2>
        <p>BJ Electronics applies access controls and operational safeguards appropriate to the storefront. Information is retained only as needed for fulfilment, support, record-keeping, fraud prevention and applicable business obligations. Payment settlement is not represented as occurring through unsupported methods.</p>
      </section>
    </StaticPageShell>
  );
}
