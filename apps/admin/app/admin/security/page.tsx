import type { Metadata } from "next";
import { AccountSecurityPanel } from "@/components/auth/AccountSecurityPanel";
import { requireUser } from "@/lib/auth";
import { getAuthenticationMethods } from "@/lib/oauth-accounts";
import { getOAuthProviderAvailability, isOAuthProvider } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account security",
  description: "Manage administrator authentication methods.",
  alternates: { canonical: "/admin/security" },
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AccountSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string | string[] }>;
}) {
  const user = await requireUser();
  const parameters = await searchParams;
  const linkedValue = Array.isArray(parameters.linked) ? parameters.linked[0] : parameters.linked;
  const linkedProvider = linkedValue && isOAuthProvider(linkedValue) ? linkedValue : null;
  return (
    <AccountSecurityPanel
      methods={await getAuthenticationMethods(user.id)}
      providers={getOAuthProviderAvailability()}
      linkedProvider={linkedProvider}
    />
  );
}
