import type { NextConfig } from "next";

const DEFAULT_DEV_API_BASE_URL = "http://localhost:3000";

export function readApiBaseUrlForRewrites() {
  const configuredValue =
    process.env.API_BASE_URL?.trim() ||
    (process.env.NODE_ENV !== "production" ? DEFAULT_DEV_API_BASE_URL : undefined);

  if (!configuredValue) {
    throw new Error("Missing required environment variable: API_BASE_URL");
  }

  let normalizedUrl: string;

  try {
    normalizedUrl = new URL(configuredValue).toString();
  } catch {
    throw new Error("Invalid URL in environment variable: API_BASE_URL");
  }

  return normalizedUrl.endsWith("/") ? normalizedUrl.slice(0, -1) : normalizedUrl;
}

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    const apiBaseUrl = readApiBaseUrlForRewrites();

    return {
      beforeFiles: [
        {
          source: "/uploads/:path*",
          destination: `${apiBaseUrl}/uploads/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
