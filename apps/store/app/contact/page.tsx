import type { Metadata } from "next";
import { StoreContentPage } from "@/components/StoreContentPage";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact BJ Electronics for product, order, delivery and after-sales assistance.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <StoreContentPage
      eyebrow="Contact BJ Electronics"
      title="Drop us a line."
      intro="Your feedback and questions help us improve. Contact the BJ Electronics team about products, orders, delivery, returns or the shopping experience."
    >
      <div className="caravan-contact-layout">
        <section className="caravan-contact-details">
          <article><span>⌖</span><div><h2>Service area</h2><p>Online electronics store serving customers across Bangladesh.</p></div></article>
          <article><span>✉</span><div><h3>Email us</h3><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a></div></article>
          <article><span>◷</span><div><h3>Support hours</h3><p>Saturday–Thursday, 9:00–18:30 Bangladesh time.</p></div></article>
          <article><span>▣</span><div><h3>Order support</h3><p>Include your order number when contacting support about an existing purchase.</p></div></article>
        </section>

        <form className="caravan-contact-form" action="mailto:support@bjelectronics.shop" method="post" encType="text/plain">
          <label>First name<input name="firstName" autoComplete="given-name" required /></label>
          <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
          <label>Phone number<input name="phone" type="tel" autoComplete="tel" /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label className="full">Order number <small>Optional</small><input name="orderNumber" /></label>
          <label className="full">Message<textarea name="message" required /></label>
          <button className="full" type="submit">Submit message</button>
        </form>
      </div>
    </StoreContentPage>
  );
}