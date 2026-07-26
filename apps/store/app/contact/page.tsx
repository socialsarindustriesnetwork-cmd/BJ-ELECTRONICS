import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact BJ Electronics for product, delivery, warranty and business-sales support.",
};

export default function ContactPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page">
        <section className="content-hero">
          <p className="eyebrow">Contact BJ Electronics</p>
          <h1>Product guidance and customer support when you need it.</h1>
          <p>Contact the BJ Electronics team for product selection, order questions, delivery support, warranty assistance or business sales.</p>
        </section>
        <section className="contact-layout">
          <aside className="contact-panel">
            <p className="eyebrow">Support channels</p>
            <h2>Talk to our team</h2>
            <p>Our support team responds during standard business hours in Bangladesh.</p>
            <div className="contact-list">
              <a href="mailto:support@bjelectronics.shop">✉ support@bjelectronics.shop</a>
              <a href="mailto:sales@bjelectronics.shop">▣ sales@bjelectronics.shop</a>
              <span>⌂ Bangladesh</span>
              <span>◷ Saturday–Thursday · 9:00 AM–6:30 PM</span>
            </div>
          </aside>
          <form className="contact-form" action="mailto:support@bjelectronics.shop" method="post" encType="text/plain">
            <label><span>Full name</span><input name="name" autoComplete="name" required /></label>
            <label><span>Email address</span><input type="email" name="email" autoComplete="email" required /></label>
            <label><span>Phone number</span><input type="tel" name="phone" autoComplete="tel" /></label>
            <label><span>Subject</span><input name="subject" required /></label>
            <label className="full"><span>How can we help?</span><textarea name="message" rows={7} required /></label>
            <button type="submit">Send support request</button>
          </form>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}