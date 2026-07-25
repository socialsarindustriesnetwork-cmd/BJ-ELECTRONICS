import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
    ].join("; "),
  },
];

const privateRouteHeaders = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

const authApiHeaders = [
  ...privateRouteHeaders,
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.bjelectronics.shop" }],
        destination: "https://bjelectronics.shop/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "bjelecteonics.shop" }],
        destination: "https://bjelectronics.shop/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.bjelecteonics.shop" }],
        destination: "https://bjelectronics.shop/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/:path*",
        destination: "/admin/:path*",
        permanent: true,
      },
      {
        source: "/admin/dashboard/:path*",
        destination: "/admin/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: privateRouteHeaders,
      },
      {
        source: "/sign-in",
        headers: privateRouteHeaders,
      },
      {
        source: "/sign-up",
        headers: privateRouteHeaders,
      },
      {
        source: "/api/auth/:path*",
        headers: authApiHeaders,
      },
    ];
  },
};

export default nextConfig;
