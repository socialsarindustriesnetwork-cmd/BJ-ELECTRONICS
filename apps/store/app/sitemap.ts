import type { MetadataRoute } from "next";
import { getStoreUrl } from "@bje/config";
import { listPublishedProducts } from "@bje/database";

const staticRoutes = [
  ["", "daily", 1], ["/shop", "daily", 0.9], ["/about", "monthly", 0.6], ["/contact", "monthly", 0.6], ["/faq", "monthly", 0.6], ["/shipping-returns", "monthly", 0.5], ["/warranty", "monthly", 0.5], ["/privacy", "yearly", 0.4], ["/terms", "yearly", 0.4], ["/policies/shipping", "monthly", 0.5], ["/policies/returns", "monthly", 0.5], ["/policies/refunds", "monthly", 0.5], ["/policies/privacy", "yearly", 0.4], ["/policies/terms", "yearly", 0.4],
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getStoreUrl();
  const products = await listPublishedProducts({ limit: 1000 });
  return [...staticRoutes.map(([route, changeFrequency, priority]) => ({ url: `${origin}${route}`, changeFrequency, priority })), ...products.map((product) => ({ url: `${origin}/products/${product.slug}`, lastModified: new Date(product.updatedAt), changeFrequency: "weekly" as const, priority: 0.8 }))];
}
