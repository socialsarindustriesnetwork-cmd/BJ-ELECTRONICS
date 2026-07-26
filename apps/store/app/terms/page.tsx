import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "Terms governing use of the BJ Electronics storefront and ordering services.",
};

const sections = [
  ["Using the storefront", "Customers must provide accurate information, use the storefront lawfully and avoid interfering with its operation, security or availability."],
  ["Product information", "BJ Electronics works to keep descriptions, prices and availability accurate. Product specifications, images, availability and promotions may be updated when catalog information changes."],
  ["Orders", "An order is accepted only after the checkout workflow validates the cart, price and inventory. BJ Electronics may contact the customer to confirm delivery or payment information before fulfilment."],
  ["Pricing and payment", "The checkout displays the supported payment methods and order totals. Unsupported payment methods or third-party settlement promises are not represented as available."],
  ["Delivery and risk", "Delivery timing depends on destination, product availability and fulfilment conditions. Customers should inspect delivered packages and report visible problems promptly."],
  ["Warranty and returns", "Warranty, return and replacement eligibility depends on the product, condition, supplier coverage and the circumstances of the request. Customers should keep the order reference and packaging where practical."],
  ["Liability", "Nothing in these terms excludes rights that cannot legally be excluded. BJ Electronics is not responsible for losses caused by misuse, unauthorised access, third-party outages or circumstances beyond reasonable control."],
  ["Changes and contact", "These terms may be updated as the service evolves. Questions can be sent to support@bjelectronics.shop before placing an order."],
] as const;

export default function TermsPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page">
        <section className="content-hero">
          <p className="eyebrow">Terms and conditions</p>
          <h1>Clear rules for shopping, ordering and using the store.</h1>
          <p>These terms describe the operating conditions for the BJ Electronics website, catalog and checkout services.</p>
        </section>
        <section className="content-grid">
          {sections.map(([title, copy]) => <article className="content-card" key={title}><h2>{title}</h2><p>{copy}</p></article>)}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
