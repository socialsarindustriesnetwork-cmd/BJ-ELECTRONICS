import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUrl } from "@bje/config";
import { getProductBySlug } from "@bje/database";
import { BrandLogo } from "@bje/ui";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.priceCents / 100);
  const initials = product.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="detail-page">
      <header className="store-header">
        <div className="header-inner">
          <Link className="brand-link" href="/"><BrandLogo /></Link>
          <div className="header-actions">
            <a className="secondary-link" href={getAdminUrl()}>Administration</a>
          </div>
        </div>
      </header>
      <main className="detail-main">
        <div className="detail-visual"><span className="product-mark">{initials}</span></div>
        <section className="detail-copy">
          <Link className="back-link" href="/">← Back to store</Link>
          <p className="eyebrow">{product.sku} · {product.inventoryQuantity} available</p>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <div className="detail-price">{price}</div>
          <AddToCartButton productId={product.id} disabled={product.inventoryQuantity < 1} />
        </section>
      </main>
    </div>
  );
}
