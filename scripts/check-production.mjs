import process from "node:process";

const storeValue = process.argv[2] || process.env.HOSTINGER_STORE_URL;
const adminValue = process.argv[3] || process.env.HOSTINGER_ADMIN_URL;

if (!storeValue || !adminValue) {
  console.error("Provide both store and admin production URLs.");
  process.exit(1);
}

const storeUrl = new URL(storeValue);
const adminUrl = new URL(adminValue);
const apexUrl = process.env.APEX_STORE_URL ? new URL(process.env.APEX_STORE_URL) : null;
const expectedRelease = process.env.EXPECTED_RELEASE_SHA?.trim() || "";
const requireReleaseMatch = process.env.REQUIRE_RELEASE_MATCH === "true";
const attempts = Number(process.env.HEALTH_CHECK_ATTEMPTS ?? 12);
const delayMs = Number(process.env.HEALTH_CHECK_DELAY_MS ?? 10_000);
const timeoutMs = Number(process.env.HTTP_REQUEST_TIMEOUT_MS ?? 10_000);
const headers = { "user-agent": "BJ-Electronics-GitHub-Release-Check/4.0" };

if (storeUrl.protocol !== "https:" || adminUrl.protocol !== "https:") {
  console.error("Production store and admin URLs must use HTTPS.");
  process.exit(1);
}
if (storeUrl.origin === adminUrl.origin) {
  console.error("Store and admin must use isolated origins.");
  process.exit(1);
}

async function request(url, init = {}) {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: { ...headers, ...(init.headers ?? {}) },
  });
}

async function responseText(url, init = {}) {
  const response = await request(url, init);
  const body = await response.text();
  return { response, body };
}

function assertHeader(response, name, includes) {
  const value = response.headers.get(name) ?? "";
  if (!value.toLowerCase().includes(includes.toLowerCase())) {
    throw new Error(`${response.url || "response"} is missing ${name}: ${includes}.`);
  }
}

function assertRelease(payload, hostname) {
  const actual = payload.release?.commit ?? "unknown";
  if (!expectedRelease) return;
  if (actual === "unknown") {
    const message = `${hostname} does not expose release commit metadata.`;
    if (requireReleaseMatch) throw new Error(message);
    console.warn(message);
    return;
  }
  if (!actual.startsWith(expectedRelease) && !expectedRelease.startsWith(actual)) {
    throw new Error(`${hostname} serves release ${actual}, expected ${expectedRelease}.`);
  }
}

async function assertHealth(baseUrl, path, expectedStatus, expectedService) {
  const { response, body } = await responseText(new URL(path, baseUrl), { cache: "no-store" });
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(`${baseUrl.hostname}${path} did not return JSON.`);
  }
  if (!response.ok || payload.status !== expectedStatus || payload.service !== expectedService) {
    throw new Error(
      `${baseUrl.hostname}${path} failed (HTTP ${response.status}, status ${payload.status ?? "unknown"}).`,
    );
  }
  assertHeader(response, "cache-control", "no-store");
  assertRelease(payload, baseUrl.hostname);
  return payload;
}

async function verifyStore() {
  await assertHealth(storeUrl, "/health/live", "alive", "bj-electronics-store");
  await assertHealth(storeUrl, "/health/ready", "healthy", "bj-electronics-store");

  const { response, body } = await responseText(new URL("/", storeUrl), { redirect: "manual" });
  if (!response.ok || !body.includes("BJ Electronics")) {
    throw new Error(`Store root is unavailable or invalid (HTTP ${response.status}).`);
  }
  assertHeader(response, "strict-transport-security", "max-age=");
  assertHeader(response, "content-security-policy", "default-src 'self'");
  assertHeader(response, "x-content-type-options", "nosniff");

  const rootCookie = response.headers.get("set-cookie") ?? "";
  if (/session|auth/i.test(rootCookie)) {
    throw new Error("Public storefront unexpectedly issued an authentication/session cookie.");
  }

  const adminRedirect = await request(new URL("/admin", storeUrl), { redirect: "manual" });
  const location = adminRedirect.headers.get("location") ?? "";
  if (![301, 302, 303, 307, 308].includes(adminRedirect.status) || !location.startsWith(adminUrl.origin)) {
    throw new Error(
      `Store /admin did not redirect to the isolated admin domain (HTTP ${adminRedirect.status}, location ${location}).`,
    );
  }

  const catalog = await request(new URL("/api/catalog", storeUrl), { cache: "no-store" });
  if (!catalog.ok) throw new Error(`Store catalog API failed (HTTP ${catalog.status}).`);
  const catalogPayload = await catalog.json();
  if (!Array.isArray(catalogPayload.products)) throw new Error("Store catalog API returned an invalid payload.");

  for (const path of ["/cart", "/checkout"]) {
    const page = await responseText(new URL(path, storeUrl), { redirect: "manual" });
    if (!page.response.ok || !page.body.includes("BJ Electronics")) {
      throw new Error(`Store ${path} is unavailable or invalid (HTTP ${page.response.status}).`);
    }
  }

  const cartResponse = await request(new URL("/api/cart", storeUrl), { cache: "no-store" });
  if (!cartResponse.ok) throw new Error(`Store cart API failed (HTTP ${cartResponse.status}).`);
  const cartPayload = await cartResponse.json();
  if (!cartPayload.cart || !Array.isArray(cartPayload.cart.lines)) {
    throw new Error("Store cart API returned an invalid payload.");
  }
  assertHeader(cartResponse, "cache-control", "no-store");
  const cartCookie = cartResponse.headers.get("set-cookie") ?? "";
  for (const marker of ["bje_cart=", "httponly", "secure", "samesite=lax"]) {
    if (!cartCookie.toLowerCase().includes(marker)) {
      throw new Error(`Store cart cookie is missing ${marker}.`);
    }
  }
}

async function verifyAdmin() {
  await assertHealth(adminUrl, "/health/live", "alive", "bj-electronics-admin");
  await assertHealth(adminUrl, "/health/ready", "healthy", "bj-electronics-admin");

  const root = await request(new URL("/", adminUrl), { redirect: "manual" });
  const location = root.headers.get("location") ?? "";
  if (![301, 302, 303, 307, 308].includes(root.status) || !location.includes("/sign-in")) {
    throw new Error(
      `Unauthenticated admin root did not redirect to sign-in (HTTP ${root.status}, location ${location}).`,
    );
  }

  for (const path of ["/products", "/orders"]) {
    const protectedRoute = await request(new URL(path, adminUrl), { redirect: "manual" });
    const protectedLocation = protectedRoute.headers.get("location") ?? "";
    if (![301, 302, 303, 307, 308].includes(protectedRoute.status) || !protectedLocation.includes("/sign-in")) {
      throw new Error(`Unauthenticated admin ${path} did not redirect to sign-in.`);
    }
  }

  const signIn = await request(new URL("/sign-in", adminUrl), { redirect: "manual" });
  if (!signIn.ok) throw new Error(`Admin sign-in page is unavailable (HTTP ${signIn.status}).`);
  assertHeader(signIn, "cache-control", "no-store");
  assertHeader(signIn, "x-robots-tag", "noindex");
  assertHeader(signIn, "strict-transport-security", "max-age=");
  assertHeader(signIn, "content-security-policy", "frame-ancestors 'none'");
  assertHeader(signIn, "cross-origin-resource-policy", "same-origin");
}

async function verifyApexRedirect() {
  if (!apexUrl) return;
  const response = await request(apexUrl, { redirect: "manual" });
  const location = response.headers.get("location") ?? "";
  if (![301, 302, 307, 308].includes(response.status) || !location.startsWith(storeUrl.origin)) {
    throw new Error(`Apex domain did not redirect to the canonical store (HTTP ${response.status}, location ${location}).`);
  }
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    await Promise.all([verifyStore(), verifyAdmin(), verifyApexRedirect()]);
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: "production.verification.succeeded",
      store: storeUrl.origin,
      admin: adminUrl.origin,
      expectedRelease: expectedRelease || null,
    }));
    process.exit(0);
  } catch (error) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: "production.verification.attempt_failed",
      attempt,
      error: error instanceof Error ? error.message : String(error),
    }));
  }
  if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
}

console.error("Store/admin health, transactional commerce, security, or routing verification failed.");
process.exit(1);
