import type { MetadataRoute } from "next";
import { getStoreUrl } from "@bje/config";
import { listPublishedProducts } from "@bje/database";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getStoreUrl();
  const products = await listPublishedProducts({ limit: 1000 });
  return [
    { url: origin, changeFrequency: "daily", priority: 1 },
    { url: `${origin}/categories`, changeFrequency: "daily", priority: 0.9 },
    { url: `${origin}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${origin}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${origin}/shipping-returns`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${origin}/terms`, changeFrequency: "monthly", priority: 0.5 },
    ...products.map((product) => ({
      url: `${origin}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
