import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = { title: "Returns & refunds", description: "Review the BJ Electronics return and refund support process." };

export default function ReturnsPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page">
        <section className="content-hero"><p className="eyebrow">Customer care</p><h1>Returns and refund assistance</h1><p>A clear support path for products that arrive damaged, incorrect or otherwise require review.</p></section>
        <section className="content-grid">
          <article className="content-card"><h2>1. Keep everything together</h2><p>Retain the product, packaging, included accessories, labels and proof of purchase until support confirms the next step.</p></article>
          <article className="content-card"><h2>2. Document the issue</h2><p>Take clear photos or video when a product arrives damaged, incorrect or incomplete.</p></article>
          <article className="content-card"><h2>3. Contact support</h2><p>Send your order number, customer email and a concise description to support before returning anything.</p></article>
        </section>
        <section className="content-grid">
          <article className="content-card"><h3>Review process</h3><p>Requests are assessed against product condition, delivery records, warranty terms and applicable store policy. Approved repair, replacement, return or refund instructions are communicated first.</p></article>
          <article className="content-card"><h3>Important limitations</h3><p>Unauthorized returns, customer-caused damage, missing serial information, activation locks or incomplete packaging may affect eligibility.</p></article>
          <article className="content-card support-link-card"><h3>Start a request</h3><p>Email the order number and supporting details to our customer-care team.</p><a href="mailto:support@bjelectronics.shop?subject=Return%20request">Request return support →</a></article>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
