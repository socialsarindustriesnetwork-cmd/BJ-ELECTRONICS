"use client";

import styles from "./social-auth.module.css";

type ProviderAvailability = {
  google: boolean;
  facebook: boolean;
};

function providerHref(provider: "google" | "facebook", nextPath: string): string {
  const parameters = new URLSearchParams({ next: nextPath });
  return `/api/auth/oauth/${provider}/start?${parameters.toString()}`;
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.43l-3.24-2.54c-.9.6-2.05.97-3.4.97-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.87A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.87V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 6c1.47 0 2.8.51 3.84 1.5l2.88-2.88A9.68 9.68 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.62C7.18 7.76 9.39 6 12 6Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path fill="#fff" d="M15.7 13.1h-2.4V21h-3.2v-7.9H8.5v-2.7h1.6V8.8c0-2.2 1.1-3.8 4.1-3.8 1 0 1.8.1 2 .1v2.6H14.7c-1.1 0-1.4.5-1.4 1.3v1.4h2.9l-.5 2.7Z" />
    </svg>
  );
}

export function SocialAuthButtons({
  providers,
  nextPath = "/admin",
}: {
  providers: ProviderAvailability;
  nextPath?: string;
}) {
  if (!providers.google && !providers.facebook) return null;

  return (
    <div className={styles.socialSection}>
      <div className={styles.socialGrid}>
        {providers.google && (
          <a className={styles.providerButton} href={providerHref("google", nextPath)}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </a>
        )}
        {providers.facebook && (
          <a className={styles.providerButton} href={providerHref("facebook", nextPath)}>
            <FacebookIcon />
            <span>Continue with Facebook</span>
          </a>
        )}
      </div>
      <div className={styles.divider} role="separator">
        <span>or use email and password</span>
      </div>
    </div>
  );
}
