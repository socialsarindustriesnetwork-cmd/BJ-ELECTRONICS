import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BJ Electronics Admin", template: "%s | BJ Electronics" },
  description: "Professional commerce operations dashboard for BJ Electronics.",
  applicationName: "BJ Electronics Admin",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/icons/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/icons/app-icon.svg" }],
  },
  openGraph: {
    title: "BJ Electronics Admin",
    description: "A responsive professional dashboard for store operations.",
    images: [{ url: "/brand/social/og-default.svg", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#080b14" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
