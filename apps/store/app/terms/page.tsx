import type { Metadata } from "next";
import { InfoPageShell } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "Terms & conditions", robots: { index: true, follow: true } };

export default function TermsPage() {
  return (
    <InfoPageShell eyebrow="Store policy" title="Terms and conditions" description="The operational terms that apply when browsing, ordering and requesting support from BJ Electronics.">
      <section><h2>Store information</h2><p>Product availability, price and publication status can change. The checkout process revalidates inventory and pricing before an order is created.</p></section>
      <section><h2>Orders</h2><p>Submitting checkout creates an order record but does not guarantee fulfilment until the order is reviewed and confirmed. BJ Electronics may contact the customer to verify delivery, payment or product information.</p></section>
      <section><h2>Payment</h2><p>The current storefront supports cash on delivery and bank transfer. Bank-transfer instructions and payment confirmation are coordinated by the operations team. Never send funds to an unverified destination.</p></section>
      <section><h2>Delivery, returns and warranty</h2><p>Delivery timing depends on product availability, destination and operational conditions. Return and warranty requests are assessed according to product condition, manufacturer coverage and applicable policy.</p></section>
      <section><h2>Acceptable use</h2><p>Customers must not interfere with store security, misuse checkout, submit fraudulent information, attempt unauthorized access or use automated activity that disrupts the service.</p></section>
      <section className="info-callout"><strong>Questions about these terms</strong><p>Email <a href="mailto:support@bjelectronics.shop?subject=Terms%20question">support@bjelectronics.shop</a>.</p></section>
    </InfoPageShell>
  );
}
