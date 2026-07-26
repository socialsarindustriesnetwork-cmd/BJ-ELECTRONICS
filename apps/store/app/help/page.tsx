import type { Metadata } from "next";
import Link from "next/link";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = { title: "Help center", description: "Get product, order, delivery, return and warranty assistance from BJ Electronics." };

const topics = [
  ["Product guidance", "Ask for help comparing products or choosing the right department.", "mailto:support@bjelectronics.shop?subject=Product%20guidance"],
  ["Order support", "Include your order number and the email used during checkout.", "mailto:support@bjelectronics.shop?subject=Order%20support"],
  ["Delivery help", "Get assistance with delivery details, address questions or scheduling.", "mailto:support@bjelectronics.shop?subject=Delivery%20support"],
];

export default function HelpPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page">
        <section className="content-hero"><p className="eyebrow">Customer support</p><h1>How can we help?</h1><p>Find the quickest route for product, order, delivery, return, warranty and business-purchasing questions.</p></section>
        <section className="content-grid">{topics.map(([title, copy, href]) => <a className="content-card support-link-card" href={href} key={title}><h2>{title}</h2><p>{copy}</p><span>Contact support →</span></a>)}</section>
        <section className="content-grid">
          <Link className="content-card support-link-card" href="/track-order"><h3>Track an order</h3><p>Use your order number and private access token to review the current status securely.</p><span>Open order tracking →</span></Link>
          <Link className="content-card support-link-card" href="/returns"><h3>Returns & refunds</h3><p>Review the support process before requesting a return or refund.</p><span>View return guidance →</span></Link>
          <Link className="content-card support-link-card" href="/warranty"><h3>Warranty support</h3><p>Prepare the details needed for product warranty assistance.</p><span>View warranty guidance →</span></Link>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
