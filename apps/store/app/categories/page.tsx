import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Shop electronics",
  robots: { index: false, follow: true },
  alternates: { canonical: "/shop" },
};

export default async function CategoriesCompatibilityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const values = await searchParams;
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) value.forEach((item) => next.append(key, item));
    else if (typeof value === "string") next.set(key, value);
  }
  const suffix = next.toString();
  redirect(suffix ? `/shop?${suffix}` : "/shop");
}
