const DEFAULT_API_BASE_URL =
  "https://port-0-commerce-be-mmveg06487ac90d1.sel3.cloudtype.app";
const DEFAULT_SITE_URL = "http://localhost:3000";

export const env = {
  apiBaseUrl: process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "cc_access_token",
} as const;

export const isProduction = process.env.NODE_ENV === "production";
