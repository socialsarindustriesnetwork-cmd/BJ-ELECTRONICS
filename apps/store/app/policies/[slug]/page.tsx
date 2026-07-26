import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InfoPage } from "@/components/InfoPage";

type Policy = {
  title: string;
  eyebrow: string;
  introduction: string;
  sections: Array<{ title: string; paragraphs?: string[]; items?: string[] }>;
};

const policies: Record<string, Policy> = {
  shipping: {
    title: "Shipping & delivery",
    eyebrow: "Shopping information",
    introduction: "How BJ Electronics prepares, verifies and coordinates delivery of confirmed orders across Bangladesh.",
    sections: [
      { title: "Order preparation", paragraphs: ["Published stock is checked again during checkout. After an order is accepted, the operations team confirms availability, contact information and delivery requirements before fulfilment."] },
      { title: "Delivery estimates", paragraphs: ["Delivery time depends on destination, product type, inventory location and courier capacity. Customers receive an updated estimate when the order is confirmed."] },
      { title: "Receiving an order", items: ["Provide an active phone number and complete delivery address.", "Inspect the external package before accepting delivery.", "Report visible damage or an incorrect product promptly with the order number and photographs."] },
      { title: "Delivery charges", paragraphs: ["Charges are calculated or confirmed according to destination, weight, size and any active delivery promotion. The final order total is shown or communicated before fulfilment."] },
    ],
  },
  returns: {
    title: "Return policy",
    eyebrow: "Customer care",
    introduction: "The conditions and steps for requesting a return after receiving an eligible BJ Electronics order.",
    sections: [
      { title: "Return eligibility", items: ["The product must be unused and include original packaging, accessories and documentation unless it arrived defective.", "The request must identify the order and explain the reason for return.", "Products with customer-caused damage, missing serial labels or incomplete accessories may be ineligible."] },
      { title: "Damaged or incorrect products", paragraphs: ["Contact support as soon as possible and provide the order number, package condition and clear photographs. The team will review the evidence and provide the next approved step."] },
      { title: "Return transport", paragraphs: ["Responsibility for return transport depends on the reason for return. BJ Electronics coordinates the method when the return is caused by an incorrect, damaged or defective shipment."] },
      { title: "Inspection", paragraphs: ["Returned items are inspected before exchange, refund or rejection. Approval depends on product condition and the documented return reason."] },
    ],
  },
  refunds: {
    title: "Refund policy",
    eyebrow: "Customer care",
    introduction: "How approved refunds are reviewed, calculated and completed for BJ Electronics orders.",
    sections: [
      { title: "Approved refunds", paragraphs: ["A refund is initiated only after cancellation approval or inspection of an eligible returned product. The refund amount may exclude non-refundable delivery or handling costs when the order was fulfilled correctly."] },
      { title: "Processing method", paragraphs: ["Refunds are returned through an appropriate verified method. Bank-transfer refunds require correct account information belonging to the customer or an authorized recipient."] },
      { title: "Processing time", paragraphs: ["Review and settlement time varies by payment method and financial institution. Support provides a status update after the refund has been approved and submitted."] },
      { title: "Order cancellation", paragraphs: ["Contact support promptly to request cancellation. Orders that have already been packed, transferred to a courier or delivered may need to follow the return process instead."] },
    ],
  },
  privacy: {
    title: "Privacy policy",
    eyebrow: "Data protection",
    introduction: "How BJ Electronics collects and uses the information required to operate the store, process orders and provide support.",
    sections: [
      { title: "Information collected", items: ["Contact and delivery details submitted during checkout.", "Order, cart and product interaction data required for commerce operations.", "Technical and security information needed to protect the service and diagnose failures."] },
      { title: "How information is used", items: ["To process, verify and fulfil orders.", "To respond to support requests and provide order updates.", "To protect accounts, detect abuse and improve store reliability."] },
      { title: "Sharing and service providers", paragraphs: ["Information is shared only when necessary with authorized staff and operational providers such as hosting, database, courier or payment services. BJ Electronics does not sell customer personal information to advertisers."] },
      { title: "Retention and security", paragraphs: ["Information is retained only as required for operations, support, accounting, fraud prevention and legal obligations. Administrative access is separated from the public storefront and protected by authentication controls."] },
      { title: "Customer requests", paragraphs: ["Customers may contact support to request access, correction or deletion where applicable. Some records may need to be retained for legitimate business or legal requirements."] },
    ],
  },
  terms: {
    title: "Terms & conditions",
    eyebrow: "Store terms",
    introduction: "The core rules that apply when browsing, ordering from or interacting with the BJ Electronics online store.",
    sections: [
      { title: "Product information", paragraphs: ["BJ Electronics aims to keep descriptions, prices and availability accurate. Administrative updates, supplier information or technical errors may require correction before an order is confirmed."] },
      { title: "Orders", paragraphs: ["Submitting checkout creates an order request. BJ Electronics may verify stock, pricing, customer details and delivery feasibility before confirmation. An order may be cancelled when information is invalid or fulfilment is not possible."] },
      { title: "Payments", paragraphs: ["Only payment methods presented by the checkout or confirmed by authorized support are valid. Customers should not send funds to unverified accounts or share passwords, PINs or one-time codes."] },
      { title: "Acceptable use", items: ["Do not attempt unauthorized access to the storefront, administration system or customer records.", "Do not submit false orders, fraudulent information or malicious content.", "Do not copy BJ Electronics branding or represent yourself as an authorized operator without permission."] },
      { title: "Warranty and liability", paragraphs: ["Product warranty depends on the item, manufacturer and documented coverage. BJ Electronics provides reasonable support but is not responsible for misuse, unauthorized repair or damage outside approved warranty conditions."] },
      { title: "Changes", paragraphs: ["Store features, policies and terms may be updated to reflect operational, security or legal requirements. The current published version applies from its effective date."] },
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
  return {
    title: policy.title,
    description: policy.introduction,
    alternates: { canonical: `/policies/${slug}` },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();

  return (
    <InfoPage eyebrow={policy.eyebrow} title={policy.title} introduction={policy.introduction}>
      {policy.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.items ? <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
        </section>
      ))}
      <div className="policy-callout">Questions about this policy should be sent to support@bjelectronics.shop with the relevant order number when applicable.</div>
    </InfoPage>
  );
}
