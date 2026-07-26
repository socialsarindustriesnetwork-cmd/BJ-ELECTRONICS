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
  if (!ok) failures.push(`${relativePath} must exclude ${forbidden}`);
}

for (const relativePath of [
  "apps/store/app/caravan.css",
  "apps/store/app/track-order.css",
  "apps/store/app/about/page.tsx",
  "apps/store/app/contact/page.tsx",
  "apps/store/app/faq/page.tsx",
  "apps/store/app/privacy/page.tsx",
  "apps/store/app/shipping-returns/page.tsx",
  "apps/store/app/terms/page.tsx",
  "apps/store/app/warranty/page.tsx",
  "apps/store/app/track-order/page.tsx",
  "apps/store/components/TrackOrderClient.tsx",
]) checkFile(relativePath);

for (const expected of [
  "hero-departments",
  "Popular categories",
  "New arrivals",
  "Featured products",
  "Special offers",
  "Shop leading brands",
  "store-confidence-section",
]) requireText("apps/store/components/StorefrontClient.tsx", expected);

for (const expected of ["/about", "/contact", "/track-order", "primary-store-nav", "caravan-category-nav", "selectedCategory"]) {
  requireText("apps/store/components/StoreHeader.tsx", expected);
}

for (const expected of [
  "caravan-newsletter",
  "Customer care",
  "Payment & security",
  "Cash on delivery",
  "Bank transfer",
  "/track-order",
  "/faq",
  "/shipping-returns",
  "/warranty",
  "/privacy",
  "/terms",
]) requireText("apps/store/components/StoreFooter.tsx", expected);

for (const route of ["/about", "/contact", "/faq", "/shipping-returns", "/warranty", "/privacy", "/terms"]) {
  requireText("apps/store/app/sitemap.ts", route);
}

forbidText("apps/store/components/StoreFooter.tsx", "PayPal");
forbidText("apps/store/components/StoreFooter.tsx", "Apple Pay");
forbidText("apps/store/components/StoreFooter.tsx", ">VISA<");
forbidText("apps/store/components/StoreFooter.tsx", ">MC<");

requireText("apps/store/components/TrackOrderClient.tsx", "^[a-f0-9]{64}$");
requireText("apps/store/app/layout.tsx", 'import "./caravan.css"');
requireText("apps/store/app/layout.tsx", 'import "./track-order.css"');
requireText("apps/store/app/caravan.css", "@media (max-width: 680px)");
requireText("apps/store/app/caravan.css", ".caravan-hero-shell");
requireText("apps/store/app/caravan.css", ".wide-campaign-banner");
requireText("apps/store/app/track-order.css", "@media (max-width: 680px)");

if (failures.length) {
  console.error(`\nMarketplace storefront audit failed with ${failures.length} issue(s).`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nMarketplace storefront audit passed.");
