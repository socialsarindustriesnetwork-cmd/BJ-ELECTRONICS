import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact us", description: "Contact BJ Electronics for product, delivery, warranty and business-sales support.", alternates: { canonical: "/contact" } };
export default function ContactPage() { return <div className="store-shell"><StoreHeader adminUrl={getAdminUrl()} /><main className="content-page"><section className="content-hero"><p className="eyebrow">Contact BJ Electronics</p><h1>Product guidance and customer support when you need it.</h1><p>Contact the BJ Electronics team for product selection, order questions, delivery support, warranty assistance or business sales.</p></section><section className="contact-layout"><aside className="contact-panel"><p className="eyebrow">Support channels</p><h2>Talk to our team</h2><p>Our support team responds during standard business hours in Bangladesh.</p><div className="contact-list"><a href="mailto:support@bjelectronics.shop">✉ support@bjelectronics.shop</a><a href="mailto:sales@bjelectronics.shop">▣ sales@bjelectronics.shop</a><span>⌂ Bangladesh</span><span>◷ Saturday–Thursday · 9:00 AM–6:30 PM</span></div></aside><ContactForm /></section></main><StoreFooter /></div>; }
