import type { Metadata } from "next";
import { getStoreUrl } from "@bje/config";
import { listAdminProducts } from "@bje/database";
import { requireRole } from "@/lib/auth";
import { ProductManager } from "@admin/components/ProductManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products & inventory",
  alternates: { canonical: "/products" },
  robots: { index: false, follow: false, noarchive: true },
};

export default async function ProductsPage() {
  await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  const products = await listAdminProducts({ limit: 200 });
  return <ProductManager initialProducts={products} storeUrl={getStoreUrl()} />;
}
