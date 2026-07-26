import type { Product } from "@bje/database";

export const marketplaceCategories = [
  { key: "television", label: "TV & Entertainment", short: "Televisions", icon: "▣", description: "Smart TVs, sound systems and entertainment" },
  { key: "refrigerator", label: "Refrigerators & Freezers", short: "Refrigerators", icon: "▥", description: "Fresh-food storage for every household" },
  { key: "air-conditioner", label: "Air Conditioners", short: "Air Conditioners", icon: "❄", description: "Efficient cooling for home and office" },
  { key: "washing-machine", label: "Washing Machines", short: "Washing Machines", icon: "◉", description: "Automatic laundry and fabric care" },
  { key: "kitchen", label: "Kitchen Appliances", short: "Kitchen", icon: "◫", description: "Cooking, preparation and convenience" },
  { key: "mobile", label: "Mobile & Tablets", short: "Mobile", icon: "▯", description: "Connected devices and everyday mobility" },
  { key: "computing", label: "Laptops & Computing", short: "Computing", icon: "▰", description: "Work, study, gaming and productivity" },
  { key: "small-appliance", label: "Small Appliances", short: "Small Appliances", icon: "◇", description: "Useful technology for daily living" },
  { key: "audio", label: "Audio & Accessories", short: "Audio", icon: "◖", description: "Personal audio, speakers and accessories" },
] as const;

export type MarketplaceCategoryKey = (typeof marketplaceCategories)[number]["key"];

export const marketplaceBrands = ["Samsung", "LG", "Sony", "Haier", "Walton", "Singer", "Whirlpool", "Xiaomi"] as const;

export function inferMarketplaceCategory(product: Pick<Product, "name" | "description">): MarketplaceCategoryKey {
  const text = `${product.name} ${product.description}`.toLowerCase();
  if (/television|\btv\b|oled|qled|projector|home theater|soundbar/.test(text)) return "television";
  if (/refrigerator|fridge|freezer|deep freeze/.test(text)) return "refrigerator";
  if (/air conditioner|\bac\b|inverter ac|split ac|cooling/.test(text)) return "air-conditioner";
  if (/washing machine|washer|dryer|laundry/.test(text)) return "washing-machine";
  if (/microwave|oven|cooktop|cooker|blender|kettle|toaster|rice cooker|air fryer|kitchen/.test(text)) return "kitchen";
  if (/phone|mobile|smartphone|tablet|ipad/.test(text)) return "mobile";
  if (/laptop|notebook|macbook|chromebook|desktop|computer|monitor|display/.test(text)) return "computing";
  if (/headphone|headset|earbud|earphone|airpod|speaker|audio|charger|cable|adapter|power bank/.test(text)) return "audio";
  return "small-appliance";
}

export function marketplaceCategoryLabel(product: Pick<Product, "name" | "description">): string {
  const key = inferMarketplaceCategory(product);
  return marketplaceCategories.find((category) => category.key === key)?.label ?? "Electronics";
}

export function productBrand(product: Pick<Product, "name">): string {
  const normalized = product.name.trim();
  return marketplaceBrands.find((brand) => normalized.toLowerCase().startsWith(brand.toLowerCase())) ?? normalized.split(/\s+/)[0] ?? "BJ Electronics";
}
