const DEFAULT_STORE_URL = "https://www.bjelectronics.shop";
const DEFAULT_ADMIN_URL = "https://admin.bjelectronics.shop";

function origin(value: string | undefined, fallback: string): string {
  const candidate = value?.trim() || fallback;
  const parsed = new URL(candidate);
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error(`Production origin must use HTTPS: ${candidate}`);
  }
  return parsed.origin;
}

export function getStoreUrl(): string {
  return origin(process.env.NEXT_PUBLIC_STORE_URL, DEFAULT_STORE_URL);
}

export function getAdminUrl(): string {
  return origin(process.env.NEXT_PUBLIC_ADMIN_URL ?? process.env.NEXT_PUBLIC_APP_URL, DEFAULT_ADMIN_URL);
}

export const platformDomains = {
  store: DEFAULT_STORE_URL,
  admin: DEFAULT_ADMIN_URL,
} as const;

export function isStoreHost(hostname: string): boolean {
  return ["www.bjelectronics.shop", "bjelectronics.shop"].includes(hostname.toLowerCase());
}

export function isAdminHost(hostname: string): boolean {
  return ["admin.bjelectronics.shop", "www.admin.bjelectronics.shop"].includes(hostname.toLowerCase());
}
