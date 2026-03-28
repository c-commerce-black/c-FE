import { test } from "@playwright/test";

test.use({ viewport: { width: 430, height: 932 } });

async function capture(
  page: import("@playwright/test").Page,
  path: string,
  url: string,
) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path, fullPage: true });
}

test("visual review", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "지금 바로 담기 좋은 상품" }).waitFor();
  await page.screenshot({ path: "output/playwright/home-review.png", fullPage: true });

  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByAltText("C-commerce 로고").waitFor();
  await page.screenshot({ path: "output/playwright/login-review.png", fullPage: true });
  await capture(page, "output/playwright/explore-review.png", "/explore");
  await capture(page, "output/playwright/detail-review.png", "/products/mock-banana");
  await page.goto("/cart", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "C-commerce" }).waitFor();
});
