import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStoreUrl } from "@bje/config";
import { getDashboardSummary, listAdminProducts } from "@bje/database";
import { getOrderSummary } from "@bje/database/transactions";
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

  const [products, summary, orderSummary] = await Promise.all([
    listAdminProducts({ limit: 6 }),
    getDashboardSummary(),
    getOrderSummary(),
  ]);

  return (
    <AdminDashboard
      user={user}
      products={products}
      summary={summary}
      orderSummary={orderSummary}
      storeUrl={getStoreUrl()}
    />
  );
}
