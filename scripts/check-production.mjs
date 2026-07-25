import process from "node:process";

const baseUrl =
  process.argv[2] ||
  process.env.HOSTINGER_PRODUCTION_URL ||
  process.env.NEXT_PUBLIC_APP_URL;

if (!baseUrl) {
  console.error("Provide a production URL as an argument or environment variable.");
  process.exit(1);
}

const canonicalBase = new URL(baseUrl);
const healthUrl = new URL("/health", canonicalBase).toString();
const attempts = Number(process.env.HEALTH_CHECK_ATTEMPTS ?? 12);
const delayMs = Number(process.env.HEALTH_CHECK_DELAY_MS ?? 10_000);

async function verifyRouting() {
  const rootResponse = await fetch(new URL("/", canonicalBase), {
    redirect: "manual",
    headers: { "user-agent": "BJ-Electronics-GitHub-Release-Check/1.0" },
  });
  if (!rootResponse.ok) {
    throw new Error(`Storefront root is unavailable (HTTP ${rootResponse.status}).`);
  }

  const rootBody = await rootResponse.text();
  if (!rootBody.includes("BJ Electronics")) {
    throw new Error("Storefront root did not render the BJ Electronics public store shell.");
  }

  const adminResponse = await fetch(new URL("/admin", canonicalBase), {
    redirect: "manual",
    headers: { "user-agent": "BJ-Electronics-GitHub-Release-Check/1.0" },
  });
  const adminLocation = adminResponse.headers.get("location") ?? "";
  if (
    ![301, 302, 303, 307, 308].includes(adminResponse.status) ||
    !adminLocation.includes("/sign-in")
  ) {
    throw new Error(
      `Unauthenticated /admin did not redirect to sign-in (HTTP ${adminResponse.status}, location ${adminLocation}).`,
    );
  }

  console.log("Production routing is correct: public store at / and protected dashboard at /admin.");
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const response = await fetch(healthUrl, {
      headers: { "user-agent": "BJ-Electronics-GitHub-Release-Check/1.0" },
      cache: "no-store",
    });
    const body = await response.json();
    if (response.ok && body.status === "healthy") {
      await verifyRouting();
      console.log(`Production is healthy: ${healthUrl}`);
      process.exit(0);
    }
    console.error(`Attempt ${attempt}: HTTP ${response.status}`, body);
  } catch (error) {
    console.error(`Attempt ${attempt}:`, error instanceof Error ? error.message : error);
  }
  if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
}

console.error(`Production health or routing verification failed: ${healthUrl}`);
process.exit(1);
