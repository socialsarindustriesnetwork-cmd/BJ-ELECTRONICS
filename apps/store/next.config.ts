import type { NextConfig } from "next";
import path from "node:path";

const repositoryRoot = path.resolve(process.cwd(), "../..");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
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
  serverExternalPackages: ["pg"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "bjelectronics.shop" }],
        destination: "https://www.bjelectronics.shop/:path*",
        permanent: true,
      },
      { source: "/admin", destination: "https://admin.bjelectronics.shop/", permanent: true },
      { source: "/admin/:path*", destination: "https://admin.bjelectronics.shop/:path*", permanent: true },
      { source: "/sign-in", destination: "https://admin.bjelectronics.shop/sign-in", permanent: true },
      { source: "/sign-up", destination: "https://admin.bjelectronics.shop/sign-up", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/realtime", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
