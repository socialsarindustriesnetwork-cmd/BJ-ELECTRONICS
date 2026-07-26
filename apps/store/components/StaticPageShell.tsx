import type { ReactNode } from "react";
import { getAdminUrl } from "@bje/config";
import { StoreFooter } from "@/components/StoreFooter";
import { StoreHeader } from "@/components/StoreHeader";

export function StaticPageShell({
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
    <div className="store-shell static-commerce-page">
      <StoreHeader adminUrl={getAdminUrl()} />
      <main>
        <section className="static-page-hero">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </section>
        <div className="static-page-content">{children}</div>
      </main>
      <StoreFooter />
    </div>
  );
}
