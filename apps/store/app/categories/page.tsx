import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { listPublishedProducts } from "@bje/database";
import { CatalogListingClient } from "@/components/CatalogListingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop electronics",
  description: "Browse laptops, audio, smart watches, monitors, power and electronics accessories from BJ Electronics.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const products = await listPublishedProducts({ limit: 250 });
  return <CatalogListingClient products={products} adminUrl={getAdminUrl()} />;
}
