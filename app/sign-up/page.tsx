import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { getCurrentUser } from "@/lib/auth";
import { getOAuthProviderAvailability } from "@/lib/oauth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a secure BJ Electronics administration account.",
  alternates: { canonical: "/sign-up" },
  robots: { index: false, follow: false, noarchive: true },
};

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  return (
    <AuthShell
      eyebrow="Secure onboarding"
      title="Create your account"
      description="Use email and password, Google, or Facebook. The approved first account becomes the super administrator."
    >
      <SignUpForm providers={getOAuthProviderAvailability()} />
    </AuthShell>
  );
}
