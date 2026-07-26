import type { Metadata } from "next";
import Link from "next/link";
import { getAdminUrl } from "@bje/config";
import { CartClient } from "@/components/CartClient";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shopping cart",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="store-shell checkout-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="cart-main"><nav className="breadcrumbs"><Link href="/">Home</Link><span>›</span><strong>Cart</strong></nav><CartClient /></main>
      <StoreFooter />
    </div>
  );
}
