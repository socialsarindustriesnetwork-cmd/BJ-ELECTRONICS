import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = { title: "Business sales", description: "Business technology and appliance purchasing support from BJ Electronics." };

const services = [
  ["Product consultation", "Discuss requirements, compatibility, budgets and suitable electronics or appliance options."],
  ["Quotation support", "Request a documented quotation for approved product selections and quantities."],
  ["Coordinated fulfilment", "Plan delivery and communication for larger or multi-item purchasing requirements."],
  ["After-sales assistance", "Maintain a clear support path after products are delivered to your organization."],
];

export default function BusinessPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page">
        <section className="content-hero"><p className="eyebrow">BJ Electronics for business</p><h1>Dependable electronics and appliances for organizations.</h1><p>Get coordinated support for product selection, quotations, inventory planning, fulfilment and after-sales requirements.</p></section>
        <section className="content-grid">{services.slice(0, 3).map(([title, copy]) => <article className="content-card" key={title}><h2>{title}</h2><p>{copy}</p></article>)}</section>
        <section className="content-grid">
          <article className="content-card"><h3>{services[3]?.[0]}</h3><p>{services[3]?.[1]}</p></article>
          <article className="content-card"><h3>What to include</h3><p>Send the organization name, contact person, required departments, specifications, quantities, delivery location and target timeline.</p></article>
          <article className="content-card support-link-card"><h3>Request a quotation</h3><p>Share your purchasing requirements with the BJ Electronics business team.</p><a href="mailto:sales@bjelectronics.shop?subject=Business%20quotation%20request">Contact business sales →</a></article>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
