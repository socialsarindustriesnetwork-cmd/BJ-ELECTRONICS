import { getAdminUrl } from "@bje/config";
import { getDashboardSummary, listPublishedProducts } from "@bje/database";
import { StorefrontClient } from "@/components/StorefrontClient";

export const dynamic = "force-dynamic";

export default async function StorefrontPage() {
  const [products, summary] = await Promise.all([
    listPublishedProducts({ limit: 60 }),
    getDashboardSummary(),
  ]);

  return (
    <StorefrontClient
      initialProducts={products}
      latestEventId={summary.latestEventId}
      adminUrl={getAdminUrl()}
    />
  );
}
