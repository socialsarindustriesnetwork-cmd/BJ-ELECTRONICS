"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AuthenticationMethods } from "@/lib/oauth-accounts";
import styles from "./account-security.module.css";

type ProviderAvailability = { google: boolean; facebook: boolean };
type SocialProvider = "google" | "facebook";

const providerLabels: Record<SocialProvider, string> = {
  google: "Google / Gmail",
  facebook: "Facebook",
};

function connectHref(provider: SocialProvider): string {
  const query = new URLSearchParams({ mode: "link", next: "/admin/security" });
  return `/api/auth/oauth/${provider}/start?${query.toString()}`;
}

export function AccountSecurityPanel({
  methods,
  providers,
  linkedProvider,
}: {
  methods: AuthenticationMethods;
  providers: ProviderAvailability;
  linkedProvider?: string | null;
}) {
  const router = useRouter();
  const [working, setWorking] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function disconnect(provider: SocialProvider) {
    setWorking(provider);
    setError(null);
    try {
      const response = await fetch(`/api/auth/oauth/${provider}/unlink`, { method: "POST" });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to disconnect this provider.");
        return;
      }
      router.replace("/admin/security");
      router.refresh();
    } catch {
      setError("The authentication service could not be reached.");
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Account protection</p>
          <h1>Authentication & connected accounts</h1>
          <span>Manage the sign-in methods that can access your administration account.</span>
        </div>
        <Link href="/admin" className={styles.backLink}>← Back to dashboard</Link>
      </header>

      {linkedProvider && (
        <div className={styles.success} role="status">
          {providerLabels[linkedProvider as SocialProvider] ?? "Provider"} connected successfully.
        </div>
      )}
      {error && <div className={styles.error} role="alert">{error}</div>}

      <section className={styles.summaryCard}>
        <div className={styles.shield}>✓</div>
        <div>
          <h2>Protected administrator session</h2>
          <p>Sessions use secure HTTP-only cookies and can be revoked server-side.</p>
        </div>
        <span>Active</span>
      </section>

      <section className={styles.methodGrid}>
        <article className={styles.methodCard}>
          <div className={styles.methodIcon}>@</div>
          <div className={styles.methodCopy}>
            <h2>Email & password</h2>
            <p>Use your BJ Electronics administration email and password.</p>
          </div>
          <span className={methods.password ? styles.connected : styles.unavailable}>
            {methods.password ? "Enabled" : "Not configured"}
          </span>
        </article>

        {(["google", "facebook"] as const).map((provider) => {
          const connected = methods[provider];
          const configured = providers[provider];
          return (
            <article className={styles.methodCard} key={provider}>
              <div className={`${styles.methodIcon} ${styles[provider]}`}>
                {provider === "google" ? "G" : "f"}
              </div>
              <div className={styles.methodCopy}>
                <h2>{providerLabels[provider]}</h2>
                <p>
                  {provider === "google"
                    ? "Use a verified Google or Gmail identity."
                    : "Use a Facebook identity with email permission."}
                </p>
              </div>
              {connected ? (
                <button
                  className={styles.disconnectButton}
                  type="button"
                  onClick={() => disconnect(provider)}
                  disabled={working === provider}
                >
                  {working === provider ? "Disconnecting..." : "Disconnect"}
                </button>
              ) : configured ? (
                <a className={styles.connectButton} href={connectHref(provider)}>Connect</a>
              ) : (
                <span className={styles.unavailable}>Not configured</span>
              )}
            </article>
          );
        })}
      </section>

      <section className={styles.guidance}>
        <h2>Security guidance</h2>
        <ul>
          <li>Keep at least two sign-in methods connected to reduce lockout risk.</li>
          <li>Do not share administrator credentials or browser sessions.</li>
          <li>Disconnect providers you no longer control.</li>
        </ul>
      </section>
    </div>
  );
}
