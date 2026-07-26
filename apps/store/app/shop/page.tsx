import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { listPublishedProducts } from "@bje/database";
import { CatalogListingClient } from "@/components/CatalogListingClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop electronics", description: "Browse BJ Electronics televisions, appliances, mobile, computing, audio and accessories.", alternates: { canonical: "/shop" } };

export default async function ShopPage() {
  const products = await listPublishedProducts({ limit: 250 });
  return <CatalogListingClient products={products} adminUrl={getAdminUrl()} />;
}
