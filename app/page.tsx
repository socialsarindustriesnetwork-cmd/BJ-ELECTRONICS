import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  return <DashboardClient user={user} />;
}
