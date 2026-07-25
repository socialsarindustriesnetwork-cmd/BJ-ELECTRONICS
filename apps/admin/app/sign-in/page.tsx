import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { getCurrentUser } from "@/lib/auth";
import { getOAuthProviderAvailability, oauthErrorMessage, safeAdminNextPath } from "@/lib/oauth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Secure access to the BJ Electronics administration application.",
  alternates: { canonical: "/sign-in" },
  robots: { index: false, follow: false, noarchive: true },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; oauth_error?: string | string[] }>;
}) {
  const parameters = await searchParams;
  const nextValue = Array.isArray(parameters.next) ? parameters.next[0] : parameters.next;
  const nextPath = safeAdminNextPath(nextValue);
  const user = await getCurrentUser();
  if (user) redirect(nextPath);

  return (
    <AuthShell
      eyebrow="Administrator access"
      title="Welcome back"
      description="Sign in with email, Google, or Facebook to manage the BJ Electronics store."
    >
      <SignInForm
        nextPath={nextPath}
        providers={getOAuthProviderAvailability()}
        externalError={oauthErrorMessage(parameters.oauth_error)}
      />
    </AuthShell>
  );
}
