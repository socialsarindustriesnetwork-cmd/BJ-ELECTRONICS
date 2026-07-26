import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How BJ Electronics handles customer, order and storefront information.",
};

const sections = [
  ["Information we collect", "We collect the information needed to operate the storefront, create carts and orders, deliver purchases, provide support and protect the platform. This may include contact details, delivery details, order data and technical request information."],
  ["How information is used", "Information is used for order processing, inventory reservation, fulfilment, customer communication, fraud prevention, service improvement and legal compliance. We do not represent customer information as available to advertisers."],
  ["Cookies and sessions", "The storefront uses essential session data to maintain a secure shopping cart and complete checkout. Essential cookies are configured with security controls appropriate to the production environment."],
  ["Data retention", "Order and operational records are retained only for legitimate business, support, accounting, security and legal purposes. Retention periods may vary according to the type of record and applicable obligations."],
  ["Your choices", "Customers may contact BJ Electronics to request access, correction or deletion where applicable. Some transaction records may need to be retained for accounting, fraud prevention or legal requirements."],
  ["Contact", "Privacy questions can be sent to support@bjelectronics.shop. Please include enough information for the team to locate the relevant account, order or communication."],
] as const;

export default function PrivacyPage() {
  return (
    <div className="store-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="content-page">
        <section className="content-hero">
          <p className="eyebrow">Privacy policy</p>
          <h1>Transparent handling of customer and order information.</h1>
          <p>This page explains the information BJ Electronics uses to operate the online store, fulfil orders and provide secure customer support.</p>
        </section>
        <section className="content-grid">
          {sections.map(([title, copy]) => <article className="content-card" key={title}><h2>{title}</h2><p>{copy}</p></article>)}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
