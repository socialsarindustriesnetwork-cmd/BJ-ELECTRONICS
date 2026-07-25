import process from "node:process";

const storeValue = process.argv[2] || process.env.HOSTINGER_STORE_URL;
const adminValue = process.argv[3] || process.env.HOSTINGER_ADMIN_URL;

if (!storeValue || !adminValue) {
  console.error("Provide both store and admin production URLs.");
  process.exit(1);
}

const storeUrl = new URL(storeValue);
const adminUrl = new URL(adminValue);
const attempts = Number(process.env.HEALTH_CHECK_ATTEMPTS ?? 12);
const delayMs = Number(process.env.HEALTH_CHECK_DELAY_MS ?? 10_000);
const headers = { "user-agent": "BJ-Electronics-GitHub-Release-Check/2.0" };

async function responseText(url, init = {}) {
  const response = await fetch(url, { ...init, headers: { ...headers, ...(init.headers ?? {}) } });
  const body = await response.text();
  return { response, body };
}

async function assertHealthy(baseUrl, expectedService) {
  const { response, body } = await responseText(new URL("/health", baseUrl), {
    cache: "no-store",
  });
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(`${baseUrl.hostname} health endpoint did not return JSON.`);
  }
  if (!response.ok || payload.status !== "healthy" || payload.service !== expectedService) {
    throw new Error(
      `${baseUrl.hostname} health check failed (HTTP ${response.status}, service ${payload.service ?? "unknown"}).`,
    );
  }
}

async function verifyStore() {
  const { response, body } = await responseText(new URL("/", storeUrl), { redirect: "manual" });
  if (!response.ok || !body.includes("BJ Electronics")) {
    throw new Error(`Store root is unavailable or invalid (HTTP ${response.status}).`);
  }

  const adminRedirect = await fetch(new URL("/admin", storeUrl), {
    redirect: "manual",
    headers,
  });
  const location = adminRedirect.headers.get("location") ?? "";
  if (![301, 302, 303, 307, 308].includes(adminRedirect.status) || !location.startsWith(adminUrl.origin)) {
    throw new Error(
      `Store /admin did not redirect to the isolated admin domain (HTTP ${adminRedirect.status}, location ${location}).`,
    );
  }

  const catalog = await fetch(new URL("/api/catalog", storeUrl), { headers, cache: "no-store" });
  if (!catalog.ok) throw new Error(`Store catalog API failed (HTTP ${catalog.status}).`);
}

async function verifyAdmin() {
  const root = await fetch(new URL("/", adminUrl), { redirect: "manual", headers });
  const location = root.headers.get("location") ?? "";
  if (![301, 302, 303, 307, 308].includes(root.status) || !location.includes("/sign-in")) {
    throw new Error(
      `Unauthenticated admin root did not redirect to sign-in (HTTP ${root.status}, location ${location}).`,
    );
  }

  const signIn = await fetch(new URL("/sign-in", adminUrl), { redirect: "manual", headers });
  if (!signIn.ok) throw new Error(`Admin sign-in page is unavailable (HTTP ${signIn.status}).`);
  const cacheControl = signIn.headers.get("cache-control") ?? "";
  const robots = signIn.headers.get("x-robots-tag") ?? "";
  if (!cacheControl.includes("no-store") || !robots.includes("noindex")) {
    throw new Error("Admin security response headers are incomplete.");
  }
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    await Promise.all([
      assertHealthy(storeUrl, "bj-electronics-store"),
      assertHealthy(adminUrl, "bj-electronics-admin"),
    ]);
    await verifyStore();
    await verifyAdmin();
    console.log(`Store and admin are healthy: ${storeUrl.origin} + ${adminUrl.origin}`);
    process.exit(0);
  } catch (error) {
    console.error(`Attempt ${attempt}:`, error instanceof Error ? error.message : error);
  }
  if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
}

console.error("Store/admin health, separation, or routing verification failed.");
process.exit(1);
