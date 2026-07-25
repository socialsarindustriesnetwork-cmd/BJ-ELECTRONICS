import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./storefront.module.css";

export const metadata: Metadata = {
  title: "BJ Electronics — Smart technology for everyday life",
  description:
    "Shop trusted electronics, accessories, computing, audio, mobile, and smart-home products from BJ Electronics.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    title: "BJ Electronics",
    description: "Smart technology, dependable service, and secure shopping.",
    images: [{ url: "/brand/social/og-default.svg", width: 1200, height: 630 }],
  },
};

const categories = [
  { name: "Computing", detail: "Laptops, desktops and essentials", icon: "⌘" },
  { name: "Mobile", detail: "Phones, tablets and accessories", icon: "▣" },
  { name: "Audio", detail: "Headphones, speakers and sound", icon: "◉" },
  { name: "Smart home", detail: "Connected living and security", icon: "⌂" },
];

const promises = [
  ["Secure checkout", "Protected transactions and clear order confirmation."],
  ["Trusted products", "Carefully selected electronics from dependable brands."],
  ["Responsive support", "Helpful service before and after every purchase."],
];

export default function StorefrontPage() {
  return (
    <main className={styles.storefront}>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink} aria-label="BJ Electronics home">
          <Image
            src="/brand/logos/bj-electronics-horizontal.svg"
            alt="BJ Electronics"
            width={234}
            height={72}
            priority
          />
        </Link>
        <nav aria-label="Store navigation" className={styles.navigation}>
          <a href="#categories">Categories</a>
          <a href="#advantages">Why BJ Electronics</a>
          <span className={styles.launchBadge}>Store launch foundation</span>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>BJ Electronics online store</p>
          <h1>Technology selected for work, home and everyday life.</h1>
          <p className={styles.lead}>
            A secure, responsive shopping experience is being prepared at the official BJ Electronics
            domain. Product catalog, checkout and customer accounts will be activated in the next
            commerce release.
          </p>
          <div className={styles.heroActions}>
            <a href="#categories" className={styles.primaryAction}>Explore departments</a>
            <a href="mailto:support@bjelectronics.shop" className={styles.secondaryAction}>Contact support</a>
          </div>
          <div className={styles.trustRow} aria-label="Store assurances">
            <span>Secure shopping</span>
            <span>Responsive service</span>
            <span>Official domain</span>
          </div>
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.visualOrb} />
          <div className={styles.productCard}>
            <span className={styles.cardLabel}>COMING SOON</span>
            <strong>Professional electronics storefront</strong>
            <small>Catalog · inventory · checkout · orders</small>
          </div>
          <Image
            src="/brand/icons/app-icon.svg"
            alt=""
            width={220}
            height={220}
            className={styles.heroIcon}
          />
        </div>
      </section>

      <section id="categories" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Departments</p>
            <h2>Everything organized for faster discovery.</h2>
          </div>
          <p>These departments establish the public storefront architecture for the upcoming catalog.</p>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <article key={category.name} className={styles.categoryCard}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              <h3>{category.name}</h3>
              <p>{category.detail}</p>
              <span className={styles.categoryStatus}>Catalog integration pending</span>
            </article>
          ))}
        </div>
      </section>

      <section id="advantages" className={styles.promiseSection}>
        {promises.map(([title, description]) => (
          <article key={title}>
            <span aria-hidden="true">✓</span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </article>
        ))}
      </section>

      <footer className={styles.footer}>
        <div>
          <Image src="/brand/logos/bj-electronics-horizontal.svg" alt="BJ Electronics" width={190} height={58} />
          <p>Official online store: bjelectronics.shop</p>
        </div>
        <div className={styles.footerLinks}>
          <a href="mailto:support@bjelectronics.shop">Support</a>
          <Link href="/sign-in">Administration</Link>
        </div>
      </footer>
    </main>
  );
}
