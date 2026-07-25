import type { Metadata, Viewport } from "next";
import { getAdminUrl } from "@bje/config";
import "../../../app/globals.css";
import "./admin.css";

const adminUrl = getAdminUrl();

export const metadata: Metadata = {
  metadataBase: new URL(adminUrl),
  title: { default: "BJ Electronics Admin", template: "%s | BJ Electronics Admin" },
  description: "Secure commerce operations and storefront management for BJ Electronics.",
  applicationName: "BJ Electronics Admin",
  robots: { index: false, follow: false, noarchive: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080b14",
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
