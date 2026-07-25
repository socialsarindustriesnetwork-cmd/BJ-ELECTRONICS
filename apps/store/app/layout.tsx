import type { Metadata, Viewport } from "next";
import { getStoreUrl } from "@bje/config";
import "./globals.css";

const storeUrl = getStoreUrl();

export const metadata: Metadata = {
  metadataBase: new URL(storeUrl),
  title: { default: "BJ Electronics", template: "%s | BJ Electronics" },
  description: "Shop trusted electronics, computing, audio, mobile, and smart-home products.",
  applicationName: "BJ Electronics Store",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    title: "BJ Electronics",
    description: "Smart technology, dependable service, and secure shopping.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2e3591",
};

export default function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
