import Link from "next/link";
import { BrandLogo } from "@bje/ui";
import { CartClient } from "@/components/CartClient";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <div className="checkout-shell">
      <header className="store-header">
        <div className="header-inner">
          <Link className="brand-link" href="/"><BrandLogo /></Link>
          <Link className="secondary-link" href="/">Back to store</Link>
        </div>
      </header>
      <main className="cart-main"><CartClient /></main>
    </div>
  );
}
