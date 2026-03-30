export const isProduction = process.env.NODE_ENV === "production";

const DEFAULT_DEV_URLS = {
  API_BASE_URL: "http://localhost:8080",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
} as const;

function readUrlEnv(name: keyof typeof DEFAULT_DEV_URLS) {
  const value =
    process.env[name]?.trim() || (!isProduction ? DEFAULT_DEV_URLS[name] : undefined);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`Invalid URL in environment variable: ${name}`);
  }
}

export const env = {
  apiBaseUrl: readUrlEnv("API_BASE_URL"),
  siteUrl: readUrlEnv("NEXT_PUBLIC_SITE_URL"),
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "cc_access_token",
} as const;
