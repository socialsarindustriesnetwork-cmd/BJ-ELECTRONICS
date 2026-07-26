"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@bje/database";
import { ProductCard } from "@/components/ProductCard";

export function CollectionSection({ eyebrow, title, products, viewAllHref, defaultVisible = 5 }: { eyebrow?: string; title: string; products: Product[]; viewAllHref: string; defaultVisible?: number }) {
  const [visible, setVisible] = useState(defaultVisible);
  const shown = products.slice(0, visible);
  const id = `collection-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <section className="retail-section caravan-products-section reference-collection" aria-labelledby={id}>
    <div className="retail-section-heading reference-collection-heading"><div>{eyebrow ? <span>{eyebrow}</span> : null}<h2 id={id}>{title}</h2></div><Link href={viewAllHref}>View all</Link></div>
    {shown.length ? <><div className="reference-product-row">{shown.map((product) => <ProductCard compact product={product} key={product.id} />)}</div>{visible < products.length ? <button className="reference-load-more" type="button" onClick={() => setVisible((value) => value + defaultVisible)}>Load More ({Math.ceil((products.length - visible) / defaultVisible)})</button> : null}</> : <div className="empty-state">Products will appear here as soon as this collection is published.</div>}
  </section>;
}
