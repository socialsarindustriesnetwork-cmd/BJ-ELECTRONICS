import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function checkFile(relativePath) {
  const target = path.join(root, relativePath);
  const ok = existsSync(target);
  console.log(`${ok ? "PASS" : "FAIL"} storefront file ${relativePath}`);
  if (!ok) failures.push(`Missing ${relativePath}`);
  return ok ? readFileSync(target, "utf8") : "";
}

function requireText(relativePath, expected) {
  const content = checkFile(relativePath);
  const ok = content.includes(expected);
  console.log(`${ok ? "PASS" : "FAIL"} ${relativePath} contains ${expected}`);
  if (!ok) failures.push(`${relativePath} must contain ${expected}`);
}

function forbidText(relativePath, forbidden) {
  const content = checkFile(relativePath);
  const ok = !content.includes(forbidden);
  console.log(`${ok ? "PASS" : "FAIL"} ${relativePath} excludes ${forbidden}`);
  if (!ok) failures.push(`${relativePath} must not contain ${forbidden}`);
}

for (const relativePath of [
  "apps/store/app/caravan.css",
  "apps/store/app/caravan-full.css",
  "apps/store/app/about/page.tsx",
  "apps/store/app/contact/page.tsx",
  "apps/store/app/shop/page.tsx",
  "apps/store/app/policies/[policy]/page.tsx",
  "apps/store/components/CollectionSection.tsx",
]) checkFile(relativePath);

for (const expected of [
  "hero-departments",
  "Popular categories",
  "Top Demand",
  "Laptops",
  "Audio & Headphones",
  "Smart Watches & Displays",
  "Power & Accessories",
  "New arrivals",
  "Featured products",
  "Special offers",
  "Shop leading brands",
  "store-confidence-section",
]) requireText("apps/store/components/StorefrontClient.tsx", expected);

for (const expected of ["/about", "/contact", "primary-store-nav", "caravan-category-nav"]) {
  requireText("apps/store/components/StoreHeader.tsx", expected);
}

for (const expected of ["caravan-newsletter", "caravan-feedback-banner", "Customer care", "Company information", "/policies/shipping", "/policies/privacy", "Payment & security"]) {
  requireText("apps/store/components/StoreFooter.tsx", expected);
}

for (const expected of ["Shipping & delivery", "Return policy", "Refund policy", "Terms and conditions", "Privacy policy"]) {
  requireText("apps/store/app/policies/[policy]/page.tsx", expected);
}

requireText("apps/store/components/CollectionSection.tsx", "Load More");
requireText("apps/store/app/layout.tsx", 'import "./caravan.css"');
requireText("apps/store/app/layout.tsx", 'import "./caravan-full.css"');
requireText("apps/store/app/caravan.css", "@media (max-width: 680px)");
requireText("apps/store/app/caravan.css", ".caravan-hero-shell");
requireText("apps/store/app/caravan.css", ".wide-campaign-banner");
requireText("apps/store/app/caravan-full.css", ".reference-product-row");
requireText("apps/store/app/caravan-full.css", ".policy-grid");

for (const source of [
  "apps/store/components/StorefrontClient.tsx",
  "apps/store/components/StoreHeader.tsx",
  "apps/store/components/StoreFooter.tsx",
  "apps/store/app/policies/[policy]/page.tsx",
]) {
  forbidText(source, "caravanbd.com");
  forbidText(source, "01609-608104");
  forbidText(source, "House 17, Avenue 2, Block C");
}

if (failures.length) {
  console.error(`\nMarketplace storefront audit failed with ${failures.length} issue(s).`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nMarketplace storefront audit passed.");