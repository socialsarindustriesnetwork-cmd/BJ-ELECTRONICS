"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@bje/database";
import { ProductCard } from "@/components/ProductCard";

export function CollectionSection({
  eyebrow,
  title,
  products,
  viewAllHref,
  defaultVisible = 5,
}: {
  eyebrow?: string;
  title: string;
  products: Product[];
  viewAllHref: string;
  defaultVisible?: number;
}) {
  const [visible, setVisible] = useState(defaultVisible);
  const displayed = products.slice(0, visible);
  const canLoadMore = visible < products.length;

  return (
    <section className="market-collection retail-section" aria-labelledby={`collection-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
      <div className="retail-section-heading market-section-heading">
        <div>
          {eyebrow ? <span>{eyebrow}</span> : null}
          <h2 id={`collection-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{title}</h2>
        </div>
        <Link href={viewAllHref}>View all</Link>
      </div>
      {displayed.length ? (
        <>
          <div className="market-product-row">
            {displayed.map((product) => <ProductCard compact product={product} key={product.id} />)}
          </div>
          {canLoadMore ? (
            <button className="market-load-more" type="button" onClick={() => setVisible((value) => value + defaultVisible)}>
              Load more products
            </button>
          ) : null}
        </>
      ) : (
        <div className="empty-state">Products will appear here as soon as this collection is published.</div>
      )}
    </section>
  );
}