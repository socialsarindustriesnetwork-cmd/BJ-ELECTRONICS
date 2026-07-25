import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a secure BJ Electronics administration account.",
  alternates: { canonical: "/sign-up" },
};

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  return (
    <AuthShell
      eyebrow="Secure onboarding"
      title="Create your account"
      description="The first registered account becomes the super administrator. Later accounts start with staff access."
    >
      <SignUpForm />
    </AuthShell>
  );
}
