import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = {
  title: "Shipping and returns",
  description: "BJ Electronics delivery, inspection, return and refund guidance.",
};

const sections = [
  ["Order processing", "Orders are reviewed after checkout confirms pricing and inventory. The support team may contact the customer when delivery information, payment instructions or product availability requires confirmation."],
  ["Delivery coverage", "BJ Electronics coordinates delivery across Bangladesh. Timing and charges depend on destination, product type, package size and fulfilment conditions."],
  ["Receiving an order", "Customers should inspect the package for visible damage, confirm the correct product and keep the invoice, accessories and packaging until the product has been checked."],
  ["Reporting a problem", "Contact support as soon as possible when an order is missing, damaged, incomplete or materially different from the confirmed order. Include the order reference and clear photos where relevant."],
  ["Return eligibility", "Return or replacement eligibility depends on product condition, supplier policy, warranty coverage, sealed packaging requirements and the reason for the request. Used, damaged or incomplete products may not qualify."],
  ["Refund processing", "Approved refunds are processed using an appropriate supported method after the returned item and documentation are inspected. Bank and payment-processing times may affect when funds become available."],
] as const;

export default function ShippingReturnsPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page">
        <section className="content-hero">
          <p className="eyebrow">Shipping and returns</p>
          <h1>Delivery and after-sales support with clear expectations.</h1>
          <p>Review how orders are processed, delivered, inspected and considered for return, replacement or refund.</p>
        </section>
        <section className="content-grid">
          {sections.map(([title, copy]) => <article className="content-card" key={title}><h2>{title}</h2><p>{copy}</p></article>)}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
