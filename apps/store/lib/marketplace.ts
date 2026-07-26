export type MarketplaceCategory = {
  key: string;
  label: string;
  short: string;
  icon: string;
  description: string;
  keywords: string[];
};

export const marketplaceCategories: MarketplaceCategory[] = [
  { key: "tv", label: "TV & Entertainment", short: "Televisions", icon: "▤", description: "Smart TVs, entertainment and home cinema", keywords: ["tv", "television", "display", "projector", "entertainment"] },
  { key: "refrigeration", label: "Refrigerators & Freezers", short: "Refrigerators", icon: "▥", description: "Cooling solutions for every household", keywords: ["refrigerator", "fridge", "freezer", "cooling"] },
  { key: "air-conditioning", label: "Air Conditioners", short: "Air conditioners", icon: "❄", description: "Efficient cooling and climate control", keywords: ["air conditioner", "ac", "cooling", "inverter"] },
  { key: "laundry", label: "Washing Machines", short: "Washing machines", icon: "◉", description: "Automatic laundry and fabric care", keywords: ["washing machine", "washer", "laundry", "dryer"] },
  { key: "kitchen", label: "Kitchen Appliances", short: "Kitchen", icon: "♨", description: "Cooking, preparation and kitchen essentials", keywords: ["oven", "microwave", "blender", "rice cooker", "kettle", "kitchen", "cooker"] },
  { key: "home-appliances", label: "Home Appliances", short: "Home appliances", icon: "⌂", description: "Useful technology for modern homes", keywords: ["vacuum", "iron", "fan", "purifier", "home appliance"] },
  { key: "mobile", label: "Phones & Tablets", short: "Phones & tablets", icon: "▯", description: "Connected mobile devices and tablets", keywords: ["phone", "mobile", "smartphone", "tablet", "ipad"] },
  { key: "computing", label: "Laptops & Computing", short: "Computing", icon: "▰", description: "Laptops, monitors and productivity gear", keywords: ["laptop", "macbook", "notebook", "computer", "monitor", "desktop"] },
  { key: "audio", label: "Audio & Headphones", short: "Audio", icon: "◖", description: "Headphones, speakers and personal audio", keywords: ["headphone", "earphone", "earbud", "speaker", "soundbar", "audio"] },
  { key: "wearables", label: "Smart Watches & Wearables", short: "Wearables", icon: "▣", description: "Connected watches and daily wellness", keywords: ["watch", "wearable", "fitness"] },
  { key: "power", label: "Power & Accessories", short: "Accessories", icon: "⌁", description: "Charging, connectivity and useful add-ons", keywords: ["charger", "cable", "adapter", "power bank", "battery", "accessory", "hub"] },
];

export const marketplaceBrands = ["Samsung", "LG", "Haier", "Walton", "Sony", "Apple", "Dell", "HP", "Lenovo", "JBL", "Anker", "Xiaomi"] as const;
