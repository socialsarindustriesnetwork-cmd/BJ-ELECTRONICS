import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration dashboard",
  description: "Secure BJ Electronics commerce administration dashboard.",
  alternates: { canonical: "/admin" },
  robots: { index: false, follow: false, noarchive: true },
  openGraph: { url: "/admin" },
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=%2Fadmin");
  return <DashboardClient user={user} />;
}
