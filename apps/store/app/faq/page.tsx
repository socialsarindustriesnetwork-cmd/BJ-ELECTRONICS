import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about BJ Electronics products, ordering, delivery, warranty and support.",
};

const questions = [
  ["Are product prices and stock current?", "Published prices and inventory come from the BJ Electronics operational catalog. The checkout verifies price and stock again before accepting an order."],
  ["Which payment methods are supported?", "The current checkout supports cash on delivery and bank transfer. Only methods shown in the checkout should be treated as available."],
  ["Do you deliver across Bangladesh?", "BJ Electronics coordinates nationwide delivery. Timing and charges vary according to destination, product type and fulfilment conditions."],
  ["How do I track an order?", "Open the Track Order page and enter the requested order information, or contact support with the order reference."],
  ["Can I change or cancel an order?", "Contact support as quickly as possible. Changes or cancellation may be possible before fulfilment begins, but cannot be guaranteed after processing or dispatch."],
  ["How do returns work?", "Return or replacement eligibility depends on product condition, packaging, supplier policy, warranty coverage and the reason for the request."],
  ["How do I request warranty support?", "Email support@bjelectronics.shop with the order reference, product name, serial number and a clear description of the issue."],
  ["Can I request help choosing a product?", "Yes. Send your intended use, preferred specifications and budget to the support team for product-selection guidance."],
  ["Do you support business purchases?", "Business and bulk-purchase enquiries can be sent to sales@bjelectronics.shop with the required products, quantities and delivery location."],
] as const;

export default function FaqPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page">
        <section className="content-hero">
          <p className="eyebrow">Frequently asked questions</p>
          <h1>Fast answers for shopping, delivery and support.</h1>
          <p>Review common questions about the BJ Electronics catalog, checkout, fulfilment and after-sales service.</p>
        </section>
        <section className="content-grid">
          {questions.map(([question, answer]) => <article className="content-card" key={question}><h2>{question}</h2><p>{answer}</p></article>)}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
