import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: "BJ Electronics storefront ordering and service terms.",
};

export default function TermsPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="full-static-page">
        <section className="full-static-hero"><span>Store terms</span><h1>Clear conditions for browsing, ordering and fulfilment.</h1><p>These terms describe the general storefront rules that apply when customers browse products, create carts and submit orders to BJ Electronics.</p></section>
        <section className="full-static-grid">
          <article className="full-static-card"><h2>Product information</h2><p>Prices, specifications, availability and promotional information may change. The final order is validated against the current catalog and inventory.</p></article>
          <article className="full-static-card"><h2>Order acceptance</h2><p>Submitting checkout creates an order request. BJ Electronics may contact the customer to verify delivery or payment details before fulfilment.</p></article>
          <article className="full-static-card"><h2>Payment methods</h2><p>The storefront currently supports cash on delivery and bank transfer. Payment status is recorded and managed through the order workflow.</p></article>
          <article className="full-static-card"><h3>Inventory</h3><p>Inventory is reserved transactionally during order creation. Orders may be adjusted or cancelled when fulfilment cannot be completed.</p></article>
          <article className="full-static-card"><h3>Customer responsibility</h3><p>Customers should provide accurate contact and delivery information and review order details before submission.</p></article>
          <article className="full-static-card"><h3>Support</h3><p>Questions about these terms or an active order can be sent to <a href="mailto:support@bjelectronics.shop?subject=Terms%20or%20order%20question">support@bjelectronics.shop</a>.</p></article>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
