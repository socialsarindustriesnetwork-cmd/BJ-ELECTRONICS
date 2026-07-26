import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageShell } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "Help center", robots: { index: true, follow: true } };

export default function HelpPage() {
  return (
    <InfoPageShell eyebrow="Customer support" title="How can we help?" description="Find the quickest route for product, delivery, order, return and warranty questions.">
      <section className="help-topic-grid">
        <a href="mailto:support@bjelectronics.shop?subject=Product%20guidance"><span>⌕</span><strong>Product guidance</strong><p>Ask for help comparing products or choosing the right category.</p></a>
        <a href="mailto:support@bjelectronics.shop?subject=Order%20support"><span>▦</span><strong>Order support</strong><p>Include your order number and the email used during checkout.</p></a>
        <Link href="/returns"><span>↻</span><strong>Returns & refunds</strong><p>Review the support process before requesting a return.</p></Link>
        <Link href="/warranty"><span>♢</span><strong>Warranty support</strong><p>Learn what information is required for a warranty request.</p></Link>
        <a href="mailto:support@bjelectronics.shop?subject=Delivery%20support"><span>▱</span><strong>Delivery support</strong><p>Get help with delivery details, scheduling or address questions.</p></a>
        <Link href="/business"><span>▤</span><strong>Business sales</strong><p>Request guidance for coordinated or higher-volume purchases.</p></Link>
      </section>
      <section><h2>Private order links</h2><p>After checkout, the store provides a private order link containing an access token. Keep that link confidential. It is the safest way to review the recorded order and its current status.</p></section>
      <section><h2>Contact information</h2><p>Email <a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a> for customer assistance or <a href="mailto:sales@bjelectronics.shop">sales@bjelectronics.shop</a> for business purchasing.</p></section>
    </InfoPageShell>
  );
}
