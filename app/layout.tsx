import type { Metadata, Viewport } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bjelectronics.shop";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "BJ Electronics Admin", template: "%s | BJ Electronics" },
  description: "Secure professional commerce operations dashboard for BJ Electronics.",
  applicationName: "BJ Electronics Admin",
  alternates: { canonical: "/admin" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/icons/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/icons/app-icon.svg" }],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: {
    type: "website",
    url: "/admin",
    title: "BJ Electronics Admin",
    description: "Secure responsive dashboard for store operations.",
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

const themeScript = `
  try {
    const saved = localStorage.getItem("bj-theme");
    const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  } catch {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
