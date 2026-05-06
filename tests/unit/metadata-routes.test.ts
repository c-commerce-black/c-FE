import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

async function loadMetadataRoutes() {
  vi.resetModules();
  const [{ default: sitemap }, { default: robots }] = await Promise.all([
    import("@/app/sitemap"),
    import("@/app/robots"),
  ]);

  return { sitemap, robots };
}

function setNodeEnv(value: NodeJS.ProcessEnv["NODE_ENV"]) {
  process.env = {
    ...process.env,
    NODE_ENV: value,
  };
}

describe("metadata routes", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("generates sitemap and robots URLs without duplicate slashes", async () => {
    setNodeEnv("production");
    process.env.API_BASE_URL = "https://api.example.com";
    process.env.NEXT_PUBLIC_SITE_URL = "https://shop.example.com/";

    const { sitemap, robots } = await loadMetadataRoutes();

    expect(sitemap().map((entry) => entry.url)).toEqual(
      expect.arrayContaining([
        "https://shop.example.com/",
        "https://shop.example.com/explore",
        "https://shop.example.com/cart",
      ]),
    );
    expect(sitemap().map((entry) => entry.url)).not.toContain(
      "https://shop.example.com//explore",
    );
    expect(robots()).toMatchObject({
      sitemap: "https://shop.example.com/sitemap.xml",
      host: "https://shop.example.com",
    });
  });
});
