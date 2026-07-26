import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const checks = [];

const STORE_URL = "https://www.bjelectronics.shop";
const APEX_URL = "https://bjelectronics.shop";
const ADMIN_URL = "https://admin.bjelectronics.shop";
const TYPO_DOMAIN = ["bjelect", "eonics.shop"].join("");

function record(name, passed, detail = "") {
  checks.push({ name, passed, detail });
  if (!passed) failures.push(detail ? `${name}: ${detail}` : name);
}

function absolute(relativePath) {
  return path.join(repositoryRoot, relativePath);
}

function read(relativePath) {
  const target = absolute(relativePath);
  if (!existsSync(target)) {
    record(`file:${relativePath}`, false, "required file is missing");
    return "";
  }
  return readFileSync(target, "utf8");
}

function requireText(relativePath, expected, name = `${relativePath} contains ${expected}`) {
  const content = read(relativePath);
  record(name, content.includes(expected), `expected ${JSON.stringify(expected)}`);
}

function forbidText(relativePath, forbidden, name = `${relativePath} excludes ${forbidden}`) {
  const content = read(relativePath);
  record(name, !content.includes(forbidden), `found forbidden value ${JSON.stringify(forbidden)}`);
}

function parseJson(relativePath) {
  const content = read(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (error) {
    record(`json:${relativePath}`, false, error instanceof Error ? error.message : String(error));
    return null;
  }
}

function collectFiles(directory, output = []) {
  for (const entry of readdirSync(directory)) {
    if ([".git", ".next", "node_modules", "coverage", "dist"].includes(entry)) continue;
    const target = path.join(directory, entry);
    const stats = statSync(target);
    if (stats.isDirectory()) collectFiles(target, output);
    else output.push(target);
  }
  return output;
}

const rootPackage = parseJson("package.json");
if (rootPackage) {
  const workspaces = Array.isArray(rootPackage.workspaces) ? rootPackage.workspaces : [];
  record("workspace:store-and-packages", workspaces.includes("apps/*") && workspaces.includes("packages/*"));
  const scripts = rootPackage.scripts ?? {};
  const requiredScripts = [
    "build",
    "build:store",
    "build:admin",
    "start:store",
    "start:admin",
    "lint",
    "typecheck",
    "db:migrate",
    "db:validate",
    "validate:store",
    "validate:admin",
    "audit",
    "test",
    "quality",
  ];
  for (const script of requiredScripts) {
    record(`script:${script}`, typeof scripts[script] === "string" && scripts[script].length > 0);
  }
  record("script:test-runs-audit", scripts.test === "npm run audit", `received ${JSON.stringify(scripts.test)}`);
  record(
    "script:quality-runs-audit",
    typeof scripts.quality === "string" && scripts.quality.includes("npm run audit"),
    `received ${JSON.stringify(scripts.quality)}`,
  );
  record("engine:node22", typeof rootPackage.engines?.node === "string" && rootPackage.engines.node.includes("22"));
}

for (const app of ["store", "admin"]) {
  const appPackage = parseJson(`apps/${app}/package.json`);
  if (!appPackage) continue;
  for (const script of ["build", "start", "lint", "typecheck"]) {
    record(`workspace:${app}:${script}`, typeof appPackage.scripts?.[script] === "string");
  }
}

requireText(".env.example", `NEXT_PUBLIC_STORE_URL=${STORE_URL}`);
requireText(".env.example", `NEXT_PUBLIC_ADMIN_URL=${ADMIN_URL}`);
requireText(".env.example", `HOSTINGER_STORE_URL=${STORE_URL}`);
requireText(".env.example", `HOSTINGER_ADMIN_URL=${ADMIN_URL}`);
requireText(".env.example", `APEX_STORE_URL=${APEX_URL}`);

requireText("packages/config/src/index.ts", `const DEFAULT_STORE_URL = "${STORE_URL}"`);
requireText("packages/config/src/index.ts", `const DEFAULT_ADMIN_URL = "${ADMIN_URL}"`);
requireText("packages/config/src/index.ts", `"www.bjelectronics.shop"`);
requireText("packages/config/src/index.ts", `"admin.bjelectronics.shop"`);

requireText("apps/store/next.config.ts", `value: "bjelectronics.shop"`);
requireText("apps/store/next.config.ts", `destination: "${STORE_URL}/:path*"`);
requireText("apps/store/next.config.ts", `destination: "${ADMIN_URL}/"`);
requireText("apps/admin/next.config.ts", `destination: "${STORE_URL}"`);
requireText("apps/admin/next.config.ts", `destination: "${ADMIN_URL}/:path*"`);

for (const relativePath of [
  "apps/store/app/health/live/route.ts",
  "apps/store/app/health/ready/route.ts",
  "apps/admin/app/health/live/route.ts",
  "apps/admin/app/health/ready/route.ts",
]) {
  record(`health-route:${relativePath}`, existsSync(absolute(relativePath)));
}

for (const relativePath of [
  "apps/store/app/page.tsx",
  "apps/store/app/categories/page.tsx",
  "apps/store/app/products/[slug]/page.tsx",
  "apps/store/app/wishlist/page.tsx",
  "apps/store/app/cart/page.tsx",
  "apps/store/app/checkout/page.tsx",
  "apps/store/app/robots.ts",
  "apps/store/app/sitemap.ts",
  "apps/store/app/manifest.ts",
  "apps/store/app/marketplace.css",
  "apps/store/components/StoreHeader.tsx",
  "apps/store/components/StoreFooter.tsx",
  "apps/store/components/ProductArtwork.tsx",
  "apps/store/components/ProductCard.tsx",
  "apps/store/components/CatalogListingClient.tsx",
  "apps/store/components/ProductDetailClient.tsx",
  "apps/store/components/WishlistClient.tsx",
  "apps/store/lib/marketplace.ts",
  "apps/store/public/brand/icons/favicon.svg",
  "apps/store/public/brand/icons/app-icon.svg",
  "apps/store/public/brand/social/og-store.svg",
]) {
  record(`storefront:${relativePath}`, existsSync(absolute(relativePath)));
}

requireText("apps/store/components/StorefrontClient.tsx", "market-hero-layout", "storefront includes marketplace hero composition");
requireText("apps/store/components/StorefrontClient.tsx", "Top departments", "storefront includes department navigation");
requireText("apps/store/components/StorefrontClient.tsx", "Shop by category", "storefront includes appliance category navigation");
requireText("apps/store/components/StorefrontClient.tsx", "Today&apos;s best deals", "storefront includes timed deals section");
requireText("apps/store/components/StorefrontClient.tsx", "Shop leading brands", "storefront includes trusted brand directory");
requireText("apps/store/components/StorefrontClient.tsx", "Featured products", "storefront includes featured products");
requireText("apps/store/components/StorefrontClient.tsx", "New products", "storefront includes new arrivals");
requireText("apps/store/components/StoreHeader.tsx", "department-panel", "storefront header includes full department menu");
requireText("apps/store/components/StoreHeader.tsx", "/wishlist", "storefront header exposes wishlist");
requireText("apps/store/components/StoreHeader.tsx", "/cart", "storefront header exposes transactional cart");
requireText("apps/store/components/CatalogListingClient.tsx", "Price range", "catalog includes price filtering");
requireText("apps/store/components/CatalogListingClient.tsx", "Availability", "catalog includes availability filtering");
requireText("apps/store/components/CatalogListingClient.tsx", "productBrand", "catalog includes brand filtering");
requireText("apps/store/components/ProductDetailClient.tsx", "Add to cart", "product details include purchase action");
requireText("apps/store/components/ProductDetailClient.tsx", "Similar products", "product details include recommendations");
requireText("apps/store/components/ProductDetailClient.tsx", "Delivery & warranty", "product details include commerce information tabs");
requireText("apps/store/app/marketplace.css", "@media (max-width: 640px)", "marketplace includes mobile breakpoint");
requireText("apps/store/app/marketplace.css", ".mobile-bottom-nav", "marketplace supports mobile navigation");
requireText("apps/store/app/marketplace.css", ".marketplace-product-layout", "marketplace styles product detail layout");
requireText("apps/store/app/layout.tsx", "./marketplace.css", "storefront activates marketplace stylesheet");
requireText("apps/store/app/layout.tsx", "/manifest.webmanifest", "storefront metadata exposes PWA manifest");
requireText("apps/store/app/layout.tsx", "/brand/social/og-store.svg", "storefront metadata exposes social preview");

requireText("scripts/check-production.mjs", '"/health/live"');
requireText("scripts/check-production.mjs", '"/health/ready"');
requireText("scripts/check-production.mjs", '"/api/catalog"');
requireText("scripts/check-production.mjs", '"/api/cart"');
requireText("scripts/check-production.mjs", "verifyApexRedirect");
requireText("scripts/check-production.mjs", "REQUIRE_RELEASE_MATCH");

requireText(".github/workflows/ci.yml", `NEXT_PUBLIC_STORE_URL: ${STORE_URL}`);
requireText(".github/workflows/ci.yml", `NEXT_PUBLIC_ADMIN_URL: ${ADMIN_URL}`);
requireText(".github/workflows/ci.yml", "npm run audit");
requireText(".github/workflows/hostinger-release.yml", "REQUIRE_RELEASE_MATCH: true");
requireText(".github/workflows/hostinger-release.yml", "Validate canonical production targets");
requireText(".github/workflows/hostinger-release.yml", "exit 1");
forbidText(
  ".github/workflows/hostinger-release.yml",
  "production verification is unavailable.\n            exit 0",
  "release workflow cannot silently skip production verification",
);

for (const relativePath of ["README.md", "docs/HOSTINGER_DEPLOYMENT.md", "docs/HOSTINGER_GITHUB_INTEGRATION.md"]) {
  requireText(relativePath, STORE_URL);
  requireText(relativePath, ADMIN_URL);
}
requireText("docs/HOSTINGER_DEPLOYMENT.md", "npm run build:store");
requireText("docs/HOSTINGER_DEPLOYMENT.md", "npm run start:store");
requireText("docs/HOSTINGER_DEPLOYMENT.md", "npm run build:admin");
requireText("docs/HOSTINGER_DEPLOYMENT.md", "npm run start:admin");
requireText("docs/HOSTINGER_DEPLOYMENT.md", "/health/live");
requireText("docs/HOSTINGER_DEPLOYMENT.md", "/health/ready");
forbidText("docs/HOSTINGER_DEPLOYMENT.md", "Start command: `npm run start`");

const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".yml", ".yaml", ".txt"]);
const typoMatches = [];
for (const target of collectFiles(repositoryRoot)) {
  const relativePath = path.relative(repositoryRoot, target);
  const extension = path.extname(target);
  if (!textExtensions.has(extension) && path.basename(target) !== ".env.example") continue;
  const content = readFileSync(target, "utf8").toLowerCase();
  if (content.includes(TYPO_DOMAIN)) typoMatches.push(relativePath);
}
record("domain:misspelling-absent", typoMatches.length === 0, typoMatches.join(", "));

const scriptDirectory = absolute("scripts");
for (const target of collectFiles(scriptDirectory).filter((file) => file.endsWith(".mjs"))) {
  const result = spawnSync(process.execPath, ["--check", target], { encoding: "utf8" });
  record(
    `syntax:${path.relative(repositoryRoot, target)}`,
    result.status === 0,
    (result.stderr || result.stdout || "syntax check failed").trim(),
  );
}

for (const check of checks) {
  const prefix = check.passed ? "PASS" : "FAIL";
  console.log(`${prefix} ${check.name}${check.detail && !check.passed ? ` — ${check.detail}` : ""}`);
}

if (failures.length > 0) {
  console.error(`\nPlatform audit failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log(`\nPlatform audit passed ${checks.length} checks.`);
