import type { Metadata } from "next";
import { InfoPageShell } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "Returns & refunds" };

export default function ReturnsPage() {
  return (
    <InfoPageShell eyebrow="Customer service" title="Returns and refund assistance" description="A clear support path for products that arrive damaged, incorrect or otherwise require review.">
      <section><h2>Before requesting a return</h2><ol><li>Keep the product, packaging, accessories and proof of purchase together.</li><li>Take clear photos or video if the item arrived damaged or incorrect.</li><li>Contact support with your order number, customer email and a concise description of the issue.</li></ol></section>
      <section><h2>Review process</h2><p>Each request is assessed against the product condition, delivery record, warranty terms and applicable store policy. Approval, replacement, repair or refund instructions are communicated before any product is sent back.</p></section>
      <section><h2>Important limitations</h2><ul><li>Do not return products without receiving instructions from support.</li><li>Personal data, activation locks and customer accounts must be removed where applicable.</li><li>Physical damage caused after delivery may not qualify for return support.</li><li>Refund timing depends on the approved resolution and original payment method.</li></ul></section>
      <section className="info-callout"><strong>Start a request</strong><p>Email <a href="mailto:support@bjelectronics.shop?subject=Return%20request">support@bjelectronics.shop</a> with the order number and supporting details.</p></section>
    </InfoPageShell>
  );
}
