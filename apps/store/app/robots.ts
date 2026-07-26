import type { MetadataRoute } from "next";
import { getStoreUrl } from "@bje/config";

export default function robots(): MetadataRoute.Robots {
  const origin = getStoreUrl();
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/categories", "/products/"], disallow: ["/api/", "/cart", "/checkout", "/orders/", "/wishlist"] },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
