import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const securityHeaders = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: repositoryRoot,
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@bje/config", "@bje/database", "@bje/realtime", "@bje/ui"],
  serverExternalPackages: ["pg", "bcryptjs"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.admin.bjelectronics.shop" }],
        destination: "https://admin.bjelectronics.shop/:path*",
        permanent: true,
      },
      { source: "/admin", destination: "/", permanent: false },
      { source: "/dashboard/:path*", destination: "/:path*", permanent: true },
      { source: "/store", destination: "https://www.bjelectronics.shop", permanent: false },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
