import type { Metadata } from "next";
import { InfoPageShell } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "Privacy policy", robots: { index: true, follow: true } };

export default function PrivacyPage() {
  return (
    <InfoPageShell eyebrow="Store policy" title="Privacy policy" description="How BJ Electronics handles information used to operate the storefront, process orders and provide customer support.">
      <section><h2>Information used by the store</h2><p>The checkout process collects contact and delivery information needed to create and fulfil an order. The storefront also uses a secure cart identifier and may store wishlist or delivery-area preferences in the customer’s browser.</p></section>
      <section><h2>How information is used</h2><ul><li>To maintain the shopping cart and process requested orders.</li><li>To coordinate delivery, payment confirmation and after-sales support.</li><li>To protect the store, investigate errors and maintain operational records.</li><li>To respond to customer and business purchasing requests.</li></ul></section>
      <section><h2>Sharing and retention</h2><p>Information should only be shared with service providers where necessary for hosting, payment confirmation, delivery, security or support. Order records are retained according to operational, accounting and legal requirements.</p></section>
      <section><h2>Your choices</h2><p>You may request correction or clarification of customer information by contacting support. Browser-based wishlist and delivery preferences can be cleared through browser storage settings.</p></section>
      <section className="info-callout"><strong>Privacy questions</strong><p>Email <a href="mailto:support@bjelectronics.shop?subject=Privacy%20question">support@bjelectronics.shop</a>.</p></section>
    </InfoPageShell>
  );
}
