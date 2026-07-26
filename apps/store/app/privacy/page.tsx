import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How BJ Electronics handles storefront, cart and order information.",
};

export default function PrivacyPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="full-static-page">
        <section className="full-static-hero"><span>Privacy</span><h1>Customer information is used to operate and support the store.</h1><p>This page summarizes the categories of information processed by the BJ Electronics storefront and the operational purposes for which they are used.</p></section>
        <section className="full-static-grid">
          <article className="full-static-card"><h2>Storefront activity</h2><p>Product browsing, search and cart interactions are used to provide the requested shopping experience and maintain an active cart session.</p></article>
          <article className="full-static-card"><h2>Order information</h2><p>Contact, delivery, payment-method and order details are processed to create, fulfil and support customer orders.</p></article>
          <article className="full-static-card"><h2>Operational security</h2><p>Technical request data may be retained to protect the platform, investigate failures and enforce secure storefront and administration boundaries.</p></article>
          <article className="full-static-card"><h3>Data minimization</h3><p>Only information needed for shopping, fulfilment, support and platform operation should be collected through the storefront.</p></article>
          <article className="full-static-card"><h3>Customer requests</h3><p>Questions about an order or stored customer information can be sent to <a href="mailto:support@bjelectronics.shop?subject=Privacy%20request">support@bjelectronics.shop</a>.</p></article>
          <article className="full-static-card"><h3>Policy updates</h3><p>This notice may be revised as the store adds approved services, integrations or legal requirements.</p></article>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
