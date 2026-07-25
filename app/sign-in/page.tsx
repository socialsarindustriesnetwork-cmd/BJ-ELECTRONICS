import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Secure access to the BJ Electronics administration dashboard.",
  alternates: { canonical: "/sign-in" },
};

function safeNextPath(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) return "/admin";
  if (candidate.includes("\\") || /[\r\n]/.test(candidate)) return "/admin";

  try {
    const parsed = new URL(candidate, "https://admin.local");
    if (parsed.origin !== "https://admin.local") return "/admin";
    if (parsed.pathname !== "/admin" && !parsed.pathname.startsWith("/admin/")) return "/admin";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/admin";
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const parameters = await searchParams;
  const nextPath = safeNextPath(parameters.next);
  const user = await getCurrentUser();
  if (user) redirect(nextPath);

  return (
    <AuthShell
      eyebrow="Administrator access"
      title="Welcome back"
      description="Sign in to continue to the BJ Electronics operations dashboard."
    >
      <SignInForm nextPath={nextPath} />
    </AuthShell>
  );
}
