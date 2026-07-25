import type { Metadata } from "next";
import { getStoreUrl } from "@bje/config";
import { listOrders } from "@bje/database/transactions";
import { requireRole } from "@/lib/auth";
import { OrderManager } from "@admin/components/OrderManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  alternates: { canonical: "/orders" },
  robots: { index: false, follow: false, noarchive: true },
};

export default async function OrdersPage() {
  await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  const orders = await listOrders({ limit: 250 });
  return <OrderManager initialOrders={orders} storeUrl={getStoreUrl()} />;
}
