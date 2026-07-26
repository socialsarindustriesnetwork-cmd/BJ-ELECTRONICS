import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminUrl } from "@bje/config";
import { getProductBySlug, listPublishedProducts } from "@bje/database";
import { ProductDetailClient } from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([getProductBySlug(slug), listPublishedProducts({ limit: 24 })]);
  if (!product) notFound();
  const similar = catalog.filter((item) => item.id !== product.id).slice(0, 5);
  return <ProductDetailClient product={product} similar={similar} adminUrl={getAdminUrl()} />;
}
