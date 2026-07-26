import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { TrackOrderClient } from "@/components/TrackOrderClient";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Securely open a BJ Electronics order using its private confirmation token.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function TrackOrderPage() {
  return (
    <div className="store-shell caravan-inspired-storefront">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="track-order-page">
        <section className="track-order-card">
          <span className="marketplace-kicker">Private order access</span>
          <h1>Track your BJ Electronics order.</h1>
          <p>Use the order number and private tracking token included in the secure confirmation link generated after checkout.</p>
          <TrackOrderClient />
          <div className="track-order-note">For customer privacy, an order cannot be opened with an order number alone. Customer care cannot request your password or administrator credentials.</div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
