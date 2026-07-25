import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a secure BJ Electronics administration account.",
};

export default function SignUpPage() {
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
