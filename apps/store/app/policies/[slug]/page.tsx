import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

type Policy = {
  title: string;
  description: string;
  sections: Array<{ title: string; paragraphs?: string[]; items?: string[] }>;
};

const policies: Record<string, Policy> = {
  shipping: {
    title: "Shipping & delivery",
    description: "How BJ Electronics verifies, prepares and coordinates delivery of confirmed orders across Bangladesh.",
    sections: [
      { title: "Order preparation", paragraphs: ["Inventory, pricing, customer contact details and the delivery address are checked before fulfilment begins."] },
      { title: "Delivery timing", paragraphs: ["Estimated delivery time depends on destination, product size, inventory location and courier capacity. The operations team confirms the expected timeframe after reviewing the order."] },
      { title: "Receiving a delivery", items: ["Provide a complete address and active phone number.", "Inspect the package before accepting delivery.", "Report visible damage or an incorrect item promptly with the order number and photographs."] },
    ],
  },
  returns: {
    title: "Return policy",
    description: "Eligibility and steps for requesting a return after receiving a BJ Electronics order.",
    sections: [
      { title: "Eligibility", items: ["Products should be unused and include original packaging, accessories and documentation unless received defective.", "Return requests must identify the order and explain the reason.", "Items with customer-caused damage or missing serial labels may not qualify."] },
      { title: "Damaged or incorrect items", paragraphs: ["Contact support promptly and provide the order number, package condition and clear photographs. The team will review the evidence and confirm the approved next step."] },
      { title: "Inspection", paragraphs: ["Returned products are inspected before an exchange, refund or rejection is completed."] },
    ],
  },
  refunds: {
    title: "Refund policy",
    description: "How approved refunds are calculated and completed for eligible BJ Electronics orders.",
    sections: [
      { title: "Approval", paragraphs: ["Refunds are initiated after an approved cancellation or an accepted returned-product inspection."] },
      { title: "Settlement method", paragraphs: ["Refunds are returned through an appropriate verified method. Customers should only provide account information through authorized support channels."] },
      { title: "Processing time", paragraphs: ["Timing varies by payment method and financial institution. Support provides an update after the refund is submitted."] },
    ],
  },
  privacy: {
    title: "Privacy policy",
    description: "How BJ Electronics handles information needed to operate the storefront, process orders and provide support.",
    sections: [
      { title: "Information collected", items: ["Contact and delivery details submitted during checkout.", "Cart, order and product-interaction data required for commerce operations.", "Technical and security information needed to protect the service."] },
      { title: "How information is used", items: ["Process and fulfil orders.", "Provide order updates and customer support.", "Protect accounts, diagnose failures and improve reliability."] },
      { title: "Data sharing", paragraphs: ["Information is shared only when needed with authorized staff and operational providers such as hosting, database, courier or payment services. Customer personal information is not sold to advertisers."] },
      { title: "Security and retention", paragraphs: ["Administrative access is separated from the public store and protected by authentication controls. Records are retained only as required for operations, support, accounting and legal obligations."] },
    ],
  },
  terms: {
    title: "Terms & conditions",
    description: "The rules that apply when browsing, ordering from or interacting with the BJ Electronics store.",
    sections: [
      { title: "Product information", paragraphs: ["BJ Electronics aims to keep descriptions, prices and availability accurate. Errors may require correction before an order is confirmed."] },
      { title: "Orders", paragraphs: ["Checkout creates an order request. Stock, pricing, customer details and delivery feasibility may be verified before confirmation."] },
      { title: "Payments", paragraphs: ["Only payment methods presented by the checkout or confirmed by authorized support are valid. Never share passwords, PINs or one-time codes."] },
      { title: "Acceptable use", items: ["Do not attempt unauthorized access to customer or administration data.", "Do not submit fraudulent orders or malicious content.", "Do not copy BJ Electronics branding or claim authorization without permission."] },
      { title: "Changes", paragraphs: ["Features, policies and terms may be updated to reflect operational, security or legal requirements."] },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) return { title: "Policy not found" };
  return { title: policy.title, description: policy.description, alternates: { canonical: `/policies/${slug}` } };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();

  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page policy-page">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span>›</span><strong>{policy.title}</strong></nav>
        <section className="content-hero"><p className="eyebrow">Customer information</p><h1>{policy.title}</h1><p>{policy.description}</p></section>
        <section className="policy-content">
          {policy.sections.map((section) => <article key={section.title}><h2>{section.title}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.items ? <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}</article>)}
          <div className="policy-support">Questions about this policy should be sent to <a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a> with the relevant order number when applicable.</div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
