import type { ReactNode } from "react";
import Link from "next/link";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

const informationLinks = [
  ["About BJ Electronics", "/about"],
  ["Contact us", "/contact"],
  ["Shipping & delivery", "/policies/shipping"],
  ["Returns", "/policies/returns"],
  ["Refunds", "/policies/refunds"],
  ["Privacy", "/policies/privacy"],
  ["Terms & conditions", "/policies/terms"],
] as const;

export function InfoPage({
  eyebrow,
  title,
  introduction,
  children,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  children: ReactNode;
}) {
  return (
    <div className="store-shell info-page-shell">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="info-page-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><strong>{title}</strong></nav>
        <section className="info-hero">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{introduction}</p>
        </section>
        <div className="info-layout">
          <article className="info-content">{children}</article>
          <aside className="info-sidebar">
            <h3>Customer information</h3>
            {informationLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
          </aside>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
