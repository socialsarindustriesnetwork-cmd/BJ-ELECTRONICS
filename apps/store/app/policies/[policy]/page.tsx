import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreContentPage } from "@/components/StoreContentPage";

const policies = {
  shipping: {
    title: "Shipping & delivery",
    intro: "How BJ Electronics prepares, verifies and delivers customer orders across Bangladesh.",
    sections: [
      ["Order processing", "Orders are reviewed after checkout. Product price, availability, delivery information and payment method may be reconfirmed before fulfilment begins."],
      ["Delivery coverage", "Delivery availability and charges depend on the destination, product type, package size and fulfilment partner. Any applicable charge is shown or confirmed before dispatch."],
      ["Delivery timing", "Estimated delivery timing is communicated after order confirmation. Public holidays, weather, transport restrictions and remote destinations may extend the estimate."],
      ["Receiving an order", "Inspect the package when possible and report visible damage, missing items or an incorrect product promptly with the order number and supporting photographs."],
    ],
  },
  returns: {
    title: "Return policy",
    intro: "Clear steps for reporting an eligible product problem and arranging a reviewed return.",
    sections: [
      ["Start a return request", "Contact support with the order number, product name, reason for return and relevant photographs or video. Do not send a product back before receiving return instructions."],
      ["Product condition", "Returned products should include the original packaging, accessories, manuals, warranty documents and any supplied items. Damage caused after delivery may affect eligibility."],
      ["Inspection", "Returned items are inspected before replacement, exchange or refund approval. Product-specific warranty terms and statutory rights continue to apply."],
      ["Non-returnable situations", "Products that have been misused, physically damaged after delivery, modified, missing serial information or returned without required components may not qualify."],
    ],
  },
  refunds: {
    title: "Refund policy",
    intro: "How approved refunds are reviewed, issued and communicated to BJ Electronics customers.",
    sections: [
      ["Refund eligibility", "A refund may be approved after an order cancellation, a verified fulfilment error, an eligible returned product or another resolution agreed by BJ Electronics support."],
      ["Refund method", "Approved refunds are normally issued through the original payment channel when supported. Alternative arrangements may be required for cash-on-delivery or bank-transfer orders."],
      ["Processing time", "BJ Electronics initiates an approved refund after verification. The time for funds to appear depends on the bank, wallet, card network or payment provider."],
      ["Communication", "Keep the order number and support correspondence. The operations team will communicate the approval status and any information required to complete the refund."],
    ],
  },
  terms: {
    title: "Terms and conditions",
    intro: "The principal conditions for using the BJ Electronics storefront and placing an order.",
    sections: [
      ["Store information", "We work to keep product descriptions, images, prices and availability accurate. An obvious error may be corrected before an order is accepted or fulfilled."],
      ["Order acceptance", "Submitting checkout creates an order request. BJ Electronics may contact the customer to verify information, availability, payment or delivery before final acceptance."],
      ["Customer responsibility", "Customers must provide accurate contact, delivery and payment information and must not misuse the storefront, interfere with its operation or attempt unauthorized access."],
      ["Limitation and updates", "Product warranties are governed by the applicable manufacturer or seller terms. BJ Electronics may update these conditions as operations, services or legal requirements change."],
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro: "How BJ Electronics uses customer information required to operate the storefront and fulfil orders.",
    sections: [
      ["Information collected", "The store may collect contact details, delivery information, order contents, payment-method selection, support messages and technical session data required to operate the service."],
      ["How information is used", "Information is used to maintain carts, process orders, coordinate delivery, provide support, prevent abuse, improve operations and meet applicable accounting or legal obligations."],
      ["Service providers", "Relevant information may be shared with hosting, database, delivery, communications, payment or professional service providers only as needed to operate the store."],
      ["Customer requests", "Contact support to ask about personal information associated with an order or to request a permitted correction or deletion. Some records may need to be retained for legal or operational reasons."],
    ],
  },
} as const;

type PolicyKey = keyof typeof policies;

export function generateStaticParams() {
  return Object.keys(policies).map((policy) => ({ policy }));
}

export async function generateMetadata({ params }: { params: Promise<{ policy: string }> }): Promise<Metadata> {
  const { policy } = await params;
  const data = policies[policy as PolicyKey];
  if (!data) return { title: "Policy not found" };
  return {
    title: data.title,
    description: data.intro,
    alternates: { canonical: `/policies/${policy}` },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ policy: string }> }) {
  const { policy } = await params;
  const data = policies[policy as PolicyKey];
  if (!data) notFound();

  return (
    <StoreContentPage eyebrow="BJ Electronics policy" title={data.title} intro={data.intro}>
      <div className="caravan-content-grid">
        {data.sections.map(([heading, copy]) => (
          <article className="caravan-content-card" key={heading}>
            <h2>{heading}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </StoreContentPage>
  );
}