import type { Metadata } from "next";
import Link from "next/link";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact BJ Electronics for product questions, order support, warranty information and business enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="store-shell info-page-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="info-page-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><strong>Contact us</strong></nav>
        <section className="info-hero">
          <p className="eyebrow">Customer support</p>
          <h1>Questions, order support and product guidance.</h1>
          <p>Send BJ Electronics a clear message with the product, order or service details involved. Sensitive payment information should never be included in a contact message.</p>
        </section>
        <div className="contact-grid">
          <aside className="contact-details-panel">
            <h2>Contact details</h2>
            <p>Use the most appropriate channel below. Order-related messages should include the order number and customer email address.</p>
            <div className="contact-detail-card"><span>Email support</span><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a></div>
            <div className="contact-detail-card"><span>Business enquiries</span><a href="mailto:sales@bjelectronics.shop">sales@bjelectronics.shop</a></div>
            <div className="contact-detail-card"><span>Storefront</span><a href="https://www.bjelectronics.shop">www.bjelectronics.shop</a></div>
            <div className="contact-detail-card"><span>Service coverage</span><strong>Online support and nationwide delivery coordination in Bangladesh</strong></div>
          </aside>
          <section className="contact-form-panel">
            <h2>Send a message</h2>
            <p>This form opens the customer’s configured email application so the message can be reviewed before sending.</p>
            <ContactForm />
          </section>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
