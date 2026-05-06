import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

async function loadPlaywrightConfig() {
  vi.resetModules();
  const configModule = await import("../../playwright.config");
  return configModule.default;
}

describe("playwright config", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("does not start a local web server when a base URL is provided", async () => {
    process.env.PLAYWRIGHT_BASE_URL = "https://staging.example.com";

    const config = await loadPlaywrightConfig();

    expect(config.use?.baseURL).toBe("https://staging.example.com");
    expect(config.webServer).toBeUndefined();
  });

  it("starts the local dev server for local e2e runs", async () => {
    delete process.env.PLAYWRIGHT_BASE_URL;

    const config = await loadPlaywrightConfig();

    expect(config.use?.baseURL).toBe("http://127.0.0.1:3000");
    expect(config.webServer).toMatchObject({
      command: "pnpm dev",
      url: "http://127.0.0.1:3000",
    });
    expect(config.testIgnore).toEqual(/visual-review\.spec\.ts/);
  });
});
