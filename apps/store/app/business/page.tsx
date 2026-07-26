import type { Metadata } from "next";
import { InfoPageShell } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "Business sales", description: "Business technology purchasing support from BJ Electronics." };

export default function BusinessPage() {
  return (
    <InfoPageShell eyebrow="BJ Electronics for business" title="Dependable technology for teams and organizations" description="Get coordinated support for product selection, quotations, inventory planning and fulfilment.">
      <section className="info-value-grid"><div><strong>Product consultation</strong><p>Discuss requirements, compatibility and suitable product options.</p></div><div><strong>Quotation support</strong><p>Request a documented quotation for approved product selections.</p></div><div><strong>Coordinated orders</strong><p>Plan fulfilment and communication for larger purchasing requirements.</p></div><div><strong>After-sales assistance</strong><p>Maintain a clear support path after products are delivered.</p></div></section>
      <section><h2>Information to include</h2><ul><li>Organization name and contact person.</li><li>Required product categories, specifications and quantities.</li><li>Preferred delivery location and target timeline.</li><li>Any compatibility, installation or documentation requirements.</li></ul></section>
      <section className="info-callout"><strong>Request a business quotation</strong><p>Email <a href="mailto:sales@bjelectronics.shop?subject=Business%20quotation%20request">sales@bjelectronics.shop</a> with your purchasing requirements.</p></section>
    </InfoPageShell>
  );
}
