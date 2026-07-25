import Link from "next/link";
import { BrandLogo } from "@bje/ui";
import { CheckoutClient } from "@/components/CheckoutClient";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="checkout-shell">
      <header className="store-header">
        <div className="header-inner">
          <Link className="brand-link" href="/"><BrandLogo /></Link>
          <div className="checkout-header-note">Secure checkout · Live inventory validation</div>
        </div>
      </header>
      <main className="checkout-main"><CheckoutClient /></main>
    </div>
  );
}
