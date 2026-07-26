import type { Metadata } from "next";
import { InfoPageShell } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "Warranty support" };

export default function WarrantyPage() {
  return (
    <InfoPageShell eyebrow="After-sales service" title="Warranty support made clear" description="Prepare the right information so product warranty questions can be reviewed efficiently.">
      <section><h2>What to prepare</h2><ul><li>Your BJ Electronics order number and checkout email.</li><li>The product name, SKU or serial number where available.</li><li>A concise description of the fault and when it started.</li><li>Photos or video that clearly demonstrate the issue.</li><li>All packaging, accessories and warranty documentation supplied with the product.</li></ul></section>
      <section><h2>How warranty support works</h2><p>Warranty coverage depends on the manufacturer, product, fault type and applicable terms. BJ Electronics coordinates the initial review and provides the next approved step, which may involve troubleshooting, inspection, repair, replacement or manufacturer service.</p></section>
      <section><h2>Not normally covered</h2><p>Accidental damage, liquid damage, unauthorized repair, misuse, missing serial information, modified software or activation locks may affect warranty eligibility.</p></section>
      <section className="info-callout"><strong>Request warranty assistance</strong><p>Email <a href="mailto:support@bjelectronics.shop?subject=Warranty%20support">support@bjelectronics.shop</a> with your order and product details.</p></section>
    </InfoPageShell>
  );
}
