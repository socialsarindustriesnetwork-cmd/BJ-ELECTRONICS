import type { MetadataRoute } from "next";
import { getStoreUrl } from "@bje/config";
import { listPublishedProducts } from "@bje/database";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getStoreUrl();
  const products = await listPublishedProducts({ limit: 1000 });
  const staticPages = [
    ["", "daily", 1],
    ["/shop", "daily", 0.9],
    ["/about", "monthly", 0.55],
    ["/contact", "monthly", 0.55],
    ["/policies/shipping", "monthly", 0.4],
    ["/policies/returns", "monthly", 0.4],
    ["/policies/refunds", "monthly", 0.4],
    ["/policies/privacy", "yearly", 0.35],
    ["/policies/terms", "yearly", 0.35],
  ] as const;

  return [
    ...staticPages.map(([path, changeFrequency, priority]) => ({ url: `${origin}${path}`, changeFrequency, priority })),
    ...products.map((product) => ({
      url: `${origin}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
