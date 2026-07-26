import type { Metadata } from "next";
import Link from "next/link";
import { getAdminUrl } from "@bje/config";
import { CheckoutClient } from "@/components/CheckoutClient";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure checkout",
  robots: { index: false, follow: false, noarchive: true },
};

export default function CheckoutPage() {
  return (
    <div className="store-shell checkout-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="checkout-main"><nav className="breadcrumbs"><Link href="/">Home</Link><span>›</span><Link href="/cart">Cart</Link><span>›</span><strong>Checkout</strong></nav><CheckoutClient /></main>
      <StoreFooter />
    </div>
  );
}
