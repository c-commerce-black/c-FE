export const isProduction = process.env.NODE_ENV === "production";

const DEFAULT_DEV_URLS = {
  API_BASE_URL: "http://localhost:8080",
} as const;

const DEFAULT_DEV_SITE_URL = "http://localhost:3000";

function normalizeVercelUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return `https://${trimmed}`;
}

function readUrlEnv(name: keyof typeof DEFAULT_DEV_URLS) {
  const value =
    process.env[name]?.trim() ||
    (!isProduction ? DEFAULT_DEV_URLS[name] : undefined);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`Invalid URL in environment variable: ${name}`);
  }
}

function readSiteUrl() {
  const value =
    (!isProduction ? DEFAULT_DEV_SITE_URL : undefined) ||
    normalizeVercelUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeVercelUrl(process.env.VERCEL_URL);

  if (!value) {
    throw new Error(
      "Missing required site URL source: expected VERCEL_PROJECT_PRODUCTION_URL or VERCEL_URL",
    );
  }

  try {
    return new URL(value).toString();
  } catch {
    throw new Error("Invalid site URL derived from Vercel environment variables");
  }
}

export const env = {
  apiBaseUrl: readUrlEnv("API_BASE_URL"),
  siteUrl: readSiteUrl(),
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "cc_access_token",
} as const;
