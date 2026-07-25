import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration dashboard",
  description: "Secure BJ Electronics commerce administration dashboard.",
  alternates: { canonical: "/admin" },
  openGraph: { url: "/admin" },
};

export default async function AdminDashboardPage() {
  const user = await requireUser();
  return <DashboardClient user={user} />;
}
