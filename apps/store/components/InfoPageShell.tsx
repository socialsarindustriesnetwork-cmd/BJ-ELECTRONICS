import type { ReactNode } from "react";
import Link from "next/link";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export function InfoPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="store-shell marketplace-info-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="marketplace-info-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><strong>{title}</strong></nav>
        <header className="marketplace-info-hero"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>
        <div className="marketplace-info-layout">
          <article className="marketplace-info-content">{children}</article>
          <aside className="marketplace-info-contact"><span>Need more help?</span><h2>Talk with BJ Electronics.</h2><p>Our support team can assist with product guidance, orders, warranty questions and after-sales service.</p><a href="mailto:support@bjelectronics.shop">Contact support</a><Link href="/categories">Continue shopping</Link></aside>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
