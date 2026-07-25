import process from "node:process";

const service = process.argv.find((value) => value.startsWith("--service="))?.split("=")[1] ?? process.argv[2];
if (!['store', 'admin'].includes(service)) {
  console.error("Usage: node scripts/validate-env.mjs --service=store|admin");
  process.exit(1);
}

const errors = [];
const warnings = [];

function validateOrigin(name, expectedHostname) {
  const value = process.env[name]?.trim();
  if (!value) {
    errors.push(`${name} is required.`);
    return;
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") errors.push(`${name} must use HTTPS.`);
    if (parsed.hostname !== expectedHostname) errors.push(`${name} must use ${expectedHostname}.`);
    if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
      errors.push(`${name} must be an origin without path, query, or fragment.`);
    }
  } catch {
    errors.push(`${name} must be a valid absolute URL.`);
  }
}

function validateInteger(name, fallback, minimum, maximum) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    errors.push(`${name} must be an integer between ${minimum} and ${maximum}.`);
  }
}

function validatePair(first, second) {
  const firstConfigured = Boolean(process.env[first]?.trim());
  const secondConfigured = Boolean(process.env[second]?.trim());
  if (firstConfigured !== secondConfigured) errors.push(`${first} and ${second} must be configured together.`);
  return firstConfigured && secondConfigured;
}

validateOrigin("NEXT_PUBLIC_STORE_URL", "www.bjelectronics.shop");
validateOrigin("NEXT_PUBLIC_ADMIN_URL", "admin.bjelectronics.shop");

if (service === "admin" && process.env.NEXT_PUBLIC_APP_URL !== process.env.NEXT_PUBLIC_ADMIN_URL) {
  errors.push("NEXT_PUBLIC_APP_URL must equal NEXT_PUBLIC_ADMIN_URL for the admin service.");
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  errors.push("DATABASE_URL is required.");
} else {
  try {
    const parsed = new URL(databaseUrl);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) errors.push("DATABASE_URL must use PostgreSQL.");
    if (!parsed.hostname || parsed.pathname === "/") errors.push("DATABASE_URL must include a host and database name.");
  } catch {
    errors.push("DATABASE_URL must be a valid PostgreSQL URL.");
  }
}

validateInteger("DB_POOL_MAX", 10, 1, 50);
validateInteger("REALTIME_POLL_INTERVAL_MS", 1500, 500, 30000);

if (process.env.NODE_ENV !== "production") errors.push("NODE_ENV must equal production.");
if (process.env.DB_SSL === "false") errors.push("DB_SSL cannot be false in production.");
if (process.env.DB_SSL_REJECT_UNAUTHORIZED === "false") {
  warnings.push("DB_SSL_REJECT_UNAUTHORIZED=false weakens database certificate verification.");
}

if (service === "admin") {
  if ((process.env.AUTH_SECRET?.trim().length ?? 0) < 32) errors.push("AUTH_SECRET must contain at least 32 characters.");
  const publicSignup = process.env.ALLOW_PUBLIC_SIGNUP === "true";
  const ownerEmails = (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  if (publicSignup && ownerEmails.length === 0) errors.push("ADMIN_BOOTSTRAP_EMAILS is required while signup is enabled.");
  if (publicSignup) warnings.push("Public administrator signup is enabled.");
  validatePair("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET");
  const facebook = validatePair("FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET");
  if (facebook && !/^v\d+\.\d+$/.test(process.env.FACEBOOK_GRAPH_API_VERSION?.trim() ?? "")) {
    errors.push("FACEBOOK_GRAPH_API_VERSION must use the vNN.N format.");
  }
}

const payload = {
  timestamp: new Date().toISOString(),
  service: `bj-electronics-${service}`,
  event: "environment.validation",
  ok: errors.length === 0,
  errors,
  warnings,
};
console.log(JSON.stringify(payload, null, 2));
if (errors.length) process.exit(1);
