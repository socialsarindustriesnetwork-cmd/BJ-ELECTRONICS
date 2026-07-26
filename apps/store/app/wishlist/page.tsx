import type { Metadata } from "next";
import { getAdminUrl } from "@bje/config";
import { listPublishedProducts } from "@bje/database";
import { WishlistClient } from "@/components/WishlistClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products saved for later at BJ Electronics.",
  robots: { index: false, follow: true },
};

export default async function WishlistPage() {
  const products = await listPublishedProducts({ limit: 250 });
  return <WishlistClient products={products} adminUrl={getAdminUrl()} />;
}
