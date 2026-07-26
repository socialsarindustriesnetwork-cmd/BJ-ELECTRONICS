import type { Metadata, Viewport } from "next";
import { getStoreUrl } from "@bje/config";
import "./globals.css";
import "./marketplace.css";

const storeUrl = getStoreUrl();

export const metadata: Metadata = {
  metadataBase: new URL(storeUrl),
  title: { default: "BJ Electronics | Technology Marketplace Bangladesh", template: "%s | BJ Electronics" },
  description: "Shop trusted electronics through the BJ Electronics Bangladesh marketplace with live inventory, secure checkout and responsive customer support.",
  applicationName: "BJ Electronics Store",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/brand/icons/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/icons/app-icon.svg" }],
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "BJ Electronics",
    title: "BJ Electronics | Technology Marketplace Bangladesh",
    description: "A responsive Bangladesh electronics marketplace with live stock, protected checkout and direct support.",
    images: [{ url: "/brand/social/og-store.svg", width: 1200, height: 630, alt: "BJ Electronics online marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BJ Electronics | Technology Marketplace Bangladesh",
    description: "Trusted electronics with live inventory and secure checkout.",
    images: ["/brand/social/og-store.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#123a84" },
  ],
};

export default function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
