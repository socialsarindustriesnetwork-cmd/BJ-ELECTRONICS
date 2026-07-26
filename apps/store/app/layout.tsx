import type { Metadata, Viewport } from "next";
import { getStoreUrl } from "@bje/config";
import "./globals.css";
import "./caravan.css";
import "./caravan-full.css";
import "./caravan-v2.css";
import "./track-order.css";

const storeUrl = getStoreUrl();

export const metadata: Metadata = {
  metadataBase: new URL(storeUrl),
  title: { default: "BJ Electronics | Electronics & Appliances Marketplace", template: "%s | BJ Electronics" },
  description: "Shop televisions, appliances, mobile devices, computing, audio and accessories with live inventory, secure checkout and nationwide delivery support.",
  applicationName: "BJ Electronics Store",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  icons: { icon: [{ url: "/brand/icons/favicon.svg", type: "image/svg+xml" }], apple: [{ url: "/brand/icons/app-icon.svg" }] },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: "/", siteName: "BJ Electronics", title: "BJ Electronics | Electronics & Appliances Marketplace", description: "Trusted electronics and appliances with live inventory, secure checkout and responsive support.", images: [{ url: "/brand/social/og-store.svg", width: 1200, height: 630, alt: "BJ Electronics online marketplace" }] },
  twitter: { card: "summary_large_image", title: "BJ Electronics | Electronics & Appliances Marketplace", description: "Trusted electronics and appliances with live inventory and secure checkout.", images: ["/brand/social/og-store.svg"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#173a92" }] };
export default function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
