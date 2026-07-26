import type { ReactNode } from "react";
import { getAdminUrl } from "@bje/config";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export function StoreContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="store-shell caravan-store">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main className="caravan-content-main">
        <section className="caravan-page-hero">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </section>
        {children}
      </main>
      <StoreFooter />
    </div>
  );
}