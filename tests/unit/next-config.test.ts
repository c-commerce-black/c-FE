import { afterEach, describe, expect, it } from "vitest";

const ORIGINAL_ENV = { ...process.env };

async function loadNextConfig() {
  const nextConfigModule = await import("../../next.config");
  return nextConfigModule.default;
}

function setNodeEnv(value: NodeJS.ProcessEnv["NODE_ENV"]) {
  process.env = {
    ...process.env,
    NODE_ENV: value,
  };
}

describe("next.config rewrites", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("rewrites uploads paths to the configured API base URL", async () => {
    setNodeEnv("production");
    process.env.API_BASE_URL = "https://api.example.com/";

    const nextConfig = await loadNextConfig();
    const rewrites = await nextConfig.rewrites?.();

    expect(rewrites).toEqual({
      beforeFiles: [
        {
          source: "/uploads/:path*",
          destination: "https://api.example.com/uploads/:path*",
        },
      ],
    });
  });

  it("falls back to the development API base URL when unset", async () => {
    setNodeEnv("development");
    delete process.env.API_BASE_URL;

    const nextConfig = await loadNextConfig();
    const rewrites = await nextConfig.rewrites?.();

    expect(rewrites).toEqual({
      beforeFiles: [
        {
          source: "/uploads/:path*",
          destination: "http://localhost:8080/uploads/:path*",
        },
      ],
    });
  });
});
