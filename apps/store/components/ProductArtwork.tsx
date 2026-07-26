import type { Product } from "@bje/database";

export function inferCategory(product: Pick<Product, "name" | "description">): string {
  const text = `${product.name} ${product.description}`.toLowerCase();
  if (/laptop|notebook|macbook|chromebook/.test(text)) return "laptop";
  if (/earbud|earphone|airpod/.test(text)) return "earphones";
  if (/headphone|headset/.test(text)) return "headphones";
  if (/watch|wearable/.test(text)) return "watch";
  if (/speaker|soundbar/.test(text)) return "speaker";
  if (/monitor|display/.test(text)) return "monitor";
  if (/power bank|powerbank|charger|cable|adapter/.test(text)) return "accessory";
  if (/phone|mobile|smartphone/.test(text)) return "phone";
  return "electronics";
}

function DeviceIllustration({ category }: { category: string }) {
  if (category === "laptop" || category === "monitor") {
    return <div className={`device-art device-${category}`}><span className="device-screen"><i /><i /><i /></span><span className="device-base" /></div>;
  }
  if (category === "headphones") {
    return <div className="device-art device-headphones"><span /><span /><i /></div>;
  }
  if (category === "earphones") {
    return <div className="device-art device-earphones"><span /><span /></div>;
  }
  if (category === "watch") {
    return <div className="device-art device-watch"><span><i /></span></div>;
  }
  if (category === "speaker") {
    return <div className="device-art device-speaker"><span /><i /><i /></div>;
  }
  if (category === "phone") {
    return <div className="device-art device-phone"><span><i /></span></div>;
  }
  return <div className="device-art device-accessory"><span /><i /></div>;
}

export function ProductArtwork({ product, priority = false }: { product: Pick<Product, "name" | "description" | "imageUrl">; priority?: boolean }) {
  const category = inferCategory(product);
  return (
    <div className={`product-artwork artwork-${category}`}>
      {product.imageUrl ? (
        // Native img keeps admin-managed external media compatible without coupling the store to a fixed image host.
        <img src={product.imageUrl} alt={product.name} loading={priority ? "eager" : "lazy"} decoding="async" />
      ) : (
        <DeviceIllustration category={category} />
      )}
    </div>
  );
}
