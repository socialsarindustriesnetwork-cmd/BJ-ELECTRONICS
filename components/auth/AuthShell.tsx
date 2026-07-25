import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./auth.module.css";

const highlights = [
  "Role-aware access for store operations",
  "Protected sessions and audited sign-ins",
  "Responsive management from every device",
];

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandGlow} aria-hidden="true" />
        <Image
          className={styles.brandLogo}
          src="/brand/logos/bj-electronics-horizontal-dark.svg"
          alt="BJ Electronics"
          width={270}
          height={84}
          priority
        />
        <div className={styles.brandCopy}>
          <span className={styles.brandEyebrow}>Commerce command center</span>
          <h1>Run every part of BJ Electronics with clarity.</h1>
          <p>
            Secure access to catalog, inventory, orders, customers, storefront,
            analytics, integrations, and operational controls.
          </p>
          <div className={styles.highlightList}>
            {highlights.map((item) => (
              <div key={item} className={styles.highlightItem}>
                <span aria-hidden="true">✓</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.securityCard}>
          <span className={styles.securityIcon} aria-hidden="true">⌁</span>
          <div>
            <strong>Security-first access</strong>
            <p>Passwords are hashed and sessions are stored as revocable tokens.</p>
          </div>
        </div>
      </section>

      <main className={styles.formPanel}>
        <div className={styles.mobileBrand}>
          <Image
            src="/brand/logos/bj-electronics-horizontal.svg"
            alt="BJ Electronics"
            width={230}
            height={72}
            priority
          />
        </div>
        <div className={styles.formCard}>
          <header className={styles.formHeader}>
            <span>{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </header>
          {children}
        </div>
        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} BJ Electronics</span>
          <span>Protected administration portal</span>
        </footer>
      </main>
    </div>
  );
}
