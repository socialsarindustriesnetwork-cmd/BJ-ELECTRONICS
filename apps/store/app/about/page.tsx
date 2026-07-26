import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = {
  title: "About us",
  description: "Learn about BJ Electronics, our service standards and our commitment to dependable technology.",
};

const values = [
  ["Reliable", "We focus on dependable products, transparent availability and clear post-purchase support."],
  ["Customer focused", "Every storefront flow is designed to make product discovery, ordering and assistance straightforward."],
  ["Secure", "Catalog, cart, inventory and order operations are controlled by one transactional commerce platform."],
];

export default function AboutPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page">
        <section className="content-hero">
          <p className="eyebrow">About BJ Electronics</p>
          <h1>Smart technology, dependable service and a better shopping experience.</h1>
          <p>BJ Electronics brings carefully managed electronics, live inventory, secure checkout and responsive customer support together in one modern commerce platform.</p>
        </section>
        <section className="content-grid" aria-label="Our values">
          {values.map(([title, copy]) => <article className="content-card" key={title}><h2>{title}</h2><p>{copy}</p></article>)}
        </section>
        <section className="content-grid">
          <article className="content-card"><h3>Our catalog</h3><p>Products, pricing, publication status and stock are managed from the secure BJ Electronics administration application.</p></article>
          <article className="content-card"><h3>Our operations</h3><p>Orders are validated transactionally so pricing and inventory are checked before fulfilment begins.</p></article>
          <article className="content-card"><h3>Our support</h3><p>Customers can contact the team for product guidance, delivery questions, warranty support and returns assistance.</p></article>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}