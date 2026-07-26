import type { Product } from "@bje/database";
import { inferMarketplaceCategory } from "@/lib/marketplace";

export function inferCategory(product: Pick<Product, "name" | "description">): string {
  return inferMarketplaceCategory(product);
}

function ApplianceIllustration({ category }: { category: string }) {
  if (category === "television") {
    return <div className="market-art market-tv"><span className="market-screen"><i /><i /><i /></span><span className="market-stand" /></div>;
  }
  if (category === "refrigerator") {
    return <div className="market-art market-fridge"><span><i /><b /></span><em /></div>;
  }
  if (category === "air-conditioner") {
    return <div className="market-art market-ac"><span><i /><i /><i /></span><em>❄</em></div>;
  }
  if (category === "washing-machine") {
    return <div className="market-art market-washer"><span><i /><b /></span><em /></div>;
  }
  if (category === "kitchen") {
    return <div className="market-art market-kitchen"><span><i /><i /></span><em /></div>;
  }
  if (category === "mobile") {
    return <div className="market-art market-mobile"><span><i /></span><em /></div>;
  }
  if (category === "computing") {
    return <div className="market-art market-laptop"><span className="market-screen"><i /><i /><i /></span><span className="market-base" /></div>;
  }
  if (category === "audio") {
    return <div className="market-art market-audio"><span /><span /><i /></div>;
  }
  return <div className="market-art market-small"><span><i /></span><em /></div>;
}

export function ProductArtwork({
  product,
  priority = false,
}: {
  product: Pick<Product, "name" | "description" | "imageUrl">;
  priority?: boolean;
}) {
  const category = inferMarketplaceCategory(product);
  return (
    <div className={`product-artwork artwork-${category}`}>
      {product.imageUrl ? (
        // Native img keeps admin-managed external media compatible without coupling the store to a fixed image host.
        <img src={product.imageUrl} alt={product.name} loading={priority ? "eager" : "lazy"} decoding="async" />
      ) : (
        <ApplianceIllustration category={category} />
      )}
    </div>
  );
}
