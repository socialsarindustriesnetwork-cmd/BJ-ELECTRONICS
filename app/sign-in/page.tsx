import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Secure access to the BJ Electronics administration dashboard.",
};

function safeNextPath(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate?.startsWith("/") && !candidate.startsWith("//") ? candidate : "/";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const parameters = await searchParams;
  return (
    <AuthShell
      eyebrow="Administrator access"
      title="Welcome back"
      description="Sign in to continue to the BJ Electronics operations dashboard."
    >
      <SignInForm nextPath={safeNextPath(parameters.next)} />
    </AuthShell>
  );
}
