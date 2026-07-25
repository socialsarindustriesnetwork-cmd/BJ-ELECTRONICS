import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStoreUrl } from "@bje/config";
import { getDashboardSummary, listAdminProducts } from "@bje/database";
import { getCurrentUser } from "@/lib/auth";
import { AdminDashboard } from "@admin/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Operations overview",
  alternates: { canonical: "/" },
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=%2Fadmin");

  const [products, summary] = await Promise.all([
    listAdminProducts({ limit: 6 }),
    getDashboardSummary(),
  ]);

  return <AdminDashboard user={user} products={products} summary={summary} storeUrl={getStoreUrl()} />;
}
