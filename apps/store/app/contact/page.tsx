import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact BJ Electronics for product, order, delivery and warranty support.",
};

export default function ContactPage() {
  return (
    <StaticPageShell
      eyebrow="Contact and support"
      title="Talk to the BJ Electronics team."
      description="Reach us for product guidance, order questions, delivery support, warranty information or business purchasing enquiries."
    >
      <section className="contact-layout">
        <aside className="contact-panel">
          <h2>Support information</h2>
          <div className="contact-list">
            <div><strong>Email support</strong><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a></div>
            <div><strong>Support channel</strong><span>Online enquiries are handled through the official BJ Electronics email address.</span></div>
            <div><strong>Service hours</strong><span>Saturday–Thursday, 9:00–18:30</span></div>
            <div><strong>Service area</strong><span>Online ordering and coordinated delivery across Bangladesh</span></div>
          </div>
        </aside>
        <section className="contact-panel">
          <h2>Send an enquiry</h2>
          <form className="contact-form" action="mailto:support@bjelectronics.shop" method="post" encType="text/plain">
            <label>Full name<input name="name" autoComplete="name" required /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
            <label>Phone number <small>Optional</small><input name="phone" type="tel" autoComplete="tel" /></label>
            <label>Subject<input name="subject" required /></label>
            <label className="full">Message<textarea name="message" rows={7} required /></label>
            <button className="full" type="submit">Send enquiry</button>
          </form>
        </section>
      </section>
    </StaticPageShell>
  );
}
