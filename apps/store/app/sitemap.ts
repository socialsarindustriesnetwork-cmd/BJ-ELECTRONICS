import type { MetadataRoute } from "next";
import { getStoreUrl } from "@bje/config";
import { listPublishedProducts } from "@bje/database";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getStoreUrl();
  const products = await listPublishedProducts({ limit: 1000 });
  const staticPages = [
    { path: "/categories", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/help", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/returns", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/warranty", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/business", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
  ];
  return [
    { url: origin, changeFrequency: "daily", priority: 1 },
    ...staticPages.map((page) => ({ url: `${origin}${page.path}`, changeFrequency: page.changeFrequency, priority: page.priority })),
    ...products.map((product) => ({
      url: `${origin}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
