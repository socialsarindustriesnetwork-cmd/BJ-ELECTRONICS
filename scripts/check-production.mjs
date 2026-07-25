import process from "node:process";

const baseUrl =
  process.argv[2] ||
  process.env.HOSTINGER_PRODUCTION_URL ||
  process.env.NEXT_PUBLIC_APP_URL;

if (!baseUrl) {
  console.error("Provide a production URL as an argument or environment variable.");
  process.exit(1);
}

const healthUrl = new URL("/health", baseUrl).toString();
const attempts = Number(process.env.HEALTH_CHECK_ATTEMPTS ?? 12);
const delayMs = Number(process.env.HEALTH_CHECK_DELAY_MS ?? 10_000);

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const response = await fetch(healthUrl, {
      headers: { "user-agent": "BJ-Electronics-GitHub-Release-Check/1.0" },
      cache: "no-store",
    });
    const body = await response.json();
    if (response.ok && body.status === "healthy") {
      console.log(`Production is healthy: ${healthUrl}`);
      process.exit(0);
    }
    console.error(`Attempt ${attempt}: HTTP ${response.status}`, body);
  } catch (error) {
    console.error(`Attempt ${attempt}:`, error instanceof Error ? error.message : error);
  }
  if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
}

console.error(`Production health verification failed: ${healthUrl}`);
process.exit(1);
