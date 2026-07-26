import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { TrackOrderClient } from "@/components/TrackOrderClient";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Securely access a BJ Electronics order with its private confirmation token.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function TrackOrderPage() {
  return (
    <div className="store-shell caravan-storefront">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="track-order-page">
        <section className="track-order-card">
          <p className="hero-kicker">Private order access</p>
          <h1>Track your BJ Electronics order.</h1>
          <p>Enter the order number and private token included in the secure confirmation link created after checkout.</p>
          <TrackOrderClient />
          <div className="track-order-note">An order cannot be opened with an order number alone. Never share administrator credentials or payment passwords with anyone claiming to provide order support.</div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
