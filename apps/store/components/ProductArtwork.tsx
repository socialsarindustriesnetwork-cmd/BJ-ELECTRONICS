import type { Product } from "@bje/database";

export function inferCategory(product: Pick<Product, "name" | "description">): string {
  const text = `${product.name} ${product.description}`.toLowerCase();
  if (/television|smart tv|\btv\b|projector/.test(text)) return "tv";
  if (/refrigerator|fridge|freezer/.test(text)) return "refrigerator";
  if (/air conditioner|\bac\b|split ac|inverter ac/.test(text)) return "air-conditioner";
  if (/washing machine|washer|dryer|laundry/.test(text)) return "washer";
  if (/microwave|oven|rice cooker|blender|kettle|toaster|cooker/.test(text)) return "kitchen";
  if (/vacuum|iron|fan|air purifier|home appliance/.test(text)) return "home-appliance";
  if (/laptop|notebook|macbook|chromebook|computer/.test(text)) return "laptop";
  if (/earbud|earphone|airpod/.test(text)) return "earphones";
  if (/headphone|headset/.test(text)) return "headphones";
  if (/watch|wearable/.test(text)) return "watch";
  if (/speaker|soundbar/.test(text)) return "speaker";
  if (/monitor|display/.test(text)) return "monitor";
  if (/power bank|powerbank|charger|cable|adapter|hub/.test(text)) return "accessory";
  if (/phone|mobile|smartphone|tablet|ipad/.test(text)) return "phone";
  return "electronics";
}

function DeviceIllustration({ category }: { category: string }) {
  if (category === "laptop" || category === "monitor" || category === "tv") {
    return <div className={`device-art device-${category}`}><span className="device-screen"><i /><i /><i /></span><span className="device-base" /></div>;
  }
  if (category === "refrigerator") {
    return <div className="device-art device-refrigerator"><span><i /><i /></span><b /></div>;
  }
  if (category === "air-conditioner") {
    return <div className="device-art device-air-conditioner"><span><i /><i /><i /></span></div>;
  }
  if (category === "washer") {
    return <div className="device-art device-washer"><span><i /><b /></span><small /></div>;
  }
  if (category === "kitchen") {
    return <div className="device-art device-kitchen"><span><i /><i /></span><b /></div>;
  }
  if (category === "home-appliance") {
    return <div className="device-art device-home-appliance"><span /><i /><b /></div>;
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
        <img src={product.imageUrl} alt={product.name} loading={priority ? "eager" : "lazy"} decoding="async" />
      ) : (
        <DeviceIllustration category={category} />
      )}
    </div>
  );
}
