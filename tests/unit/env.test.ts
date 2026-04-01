import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

async function loadEnvModule() {
  vi.resetModules();
  return import("@/lib/shared/env/env");
}

describe("env", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("uses localhost in development", async () => {
    process.env.NODE_ENV = "development";
    process.env.API_BASE_URL = "http://localhost:8080";
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    const { env } = await loadEnvModule();

    expect(env.siteUrl).toBe("http://localhost:3000/");
  });

  it("uses the Vercel production domain in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.API_BASE_URL = "https://api.example.com";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "shop.example.com";
    delete process.env.VERCEL_URL;

    const { env } = await loadEnvModule();

    expect(env.siteUrl).toBe("https://shop.example.com/");
  });

  it("falls back to the deployment URL when only VERCEL_URL is available", async () => {
    process.env.NODE_ENV = "production";
    process.env.API_BASE_URL = "https://api.example.com";
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    process.env.VERCEL_URL = "preview-shop.vercel.app";

    const { env } = await loadEnvModule();

    expect(env.siteUrl).toBe("https://preview-shop.vercel.app/");
  });
});
