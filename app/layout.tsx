import type { Metadata, Viewport } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bjelectronics.shop";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "BJ Electronics", template: "%s | BJ Electronics" },
  description: "Official BJ Electronics online store and secure commerce platform.",
  applicationName: "BJ Electronics",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/icons/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/icons/app-icon.svg" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, noimageindex: false },
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "BJ Electronics",
    description: "Smart technology, dependable service, and secure shopping.",
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
