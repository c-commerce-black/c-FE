import { expect, test } from "@playwright/test";

import { MOCK_PRODUCT_DETAILS, MOCK_PRODUCTS } from "../../lib/catalog/mock-data";

function filterProducts(url: URL) {
  const category = url.searchParams.get("category") ?? "";
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  return MOCK_PRODUCTS.filter((product) => {
    const matchesCategory = !category || product.category === category;
    const matchesQuery = !q || product.name.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}

async function mockProductApis(page: import("@playwright/test").Page) {
  await page.route("**/api/products**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/api/products/feed") {
      const pageNumber = Number(url.searchParams.get("page") ?? "1");
      const limit = Number(url.searchParams.get("limit") ?? "3");
      const products = filterProducts(url);
      const start = Math.max(0, pageNumber - 1) * limit;
      const items = products.slice(start, start + limit);
      const hasMore = start + limit < products.length;

      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            items,
            nextPage: hasMore ? pageNumber + 1 : null,
            hasMore,
            total: products.length,
          },
        }),
      });
      return;
    }

    if (url.pathname.startsWith("/api/products/")) {
      const id = decodeURIComponent(url.pathname.split("/").pop() ?? "");
      const product = MOCK_PRODUCT_DETAILS[id];

      await route.fulfill({
        status: product ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(
          product
            ? { success: true, data: { product } }
            : {
                success: false,
                error: {
                  message: "상품을 찾을 수 없습니다.",
                  statusCode: 404,
                },
              },
        ),
      });
      return;
    }

    if (url.pathname === "/api/products") {
      const products = filterProducts(url);
      const limit = Number(url.searchParams.get("limit") ?? "20");

      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            products: products.slice(0, limit),
            pagination: {
              page: 1,
              limit,
              total: products.length,
              totalPages: Math.max(1, Math.ceil(products.length / Math.max(limit, 1))),
            },
          },
        }),
      });
      return;
    }

    await route.fallback();
  });
}

test.beforeEach(async ({ page }) => {
  await mockProductApis(page);
});

test("public navigation and auth redirect work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "지금 바로 담기 좋은 상품" })).toBeVisible();

  await page.getByRole("link", { name: "네트워크" }).first().click();
  await expect(page).toHaveURL(/\/explore/);
  await expect(page.getByRole("heading", { name: "카테고리" })).toBeVisible();
  await expect(page.getByText("유기농 바나나 1송이")).toBeVisible();

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
  await expect(page.getByText("생연어 스테이크 300g")).toBeVisible();

  await page.goto("/cart");
  await expect(page).toHaveURL(/\/login\?next=%2Fcart/);
  await expect(page.getByRole("heading", { name: "C-commerce" })).toBeVisible();
});

test("login hides raw html error bodies from users", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "text/html; charset=utf-8",
      body: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="robots" content="noindex" />
          </head>
          <body>
            <script src="https://files.cloudtype.io/errorpages/assets/app.js"></script>
          </body>
        </html>
      `,
    });
  });

  await page.goto("/login");
  await page.getByLabel("이메일").fill("test@example.com");
  await page.getByLabel("비밀번호").fill("wrong-password");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page.getByText("로그인에 실패했습니다.")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("<!DOCTYPE html>");
  await expect(page.locator("body")).not.toContainText("files.cloudtype.io");
});

test("explore sort dropdown toggles and keeps filters", async ({ page }) => {
  await page.goto("/explore?category=FOOD&q=%EC%9C%A0%EA%B8%B0%EB%86%8D");
  await expect(page.getByRole("button", { name: "정렬 선택" })).toContainText("마감임박순");
  await expect(page.getByText("할인율순")).toHaveCount(0);

  await page.getByRole("button", { name: "정렬 선택" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.getByRole("menuitemradio", { name: "할인율순" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);

  await page.getByRole("button", { name: "정렬 선택" }).click();
  await page.getByRole("menuitemradio", { name: "가격낮은순" }).click();
  await expect(page).toHaveURL(/sort=price_asc/);
  await expect(page).toHaveURL(/category=FOOD/);
  await expect(page).toHaveURL(/q=%EC%9C%A0%EA%B8%B0%EB%86%8D/);
  await expect(page.getByRole("button", { name: "정렬 선택" })).toContainText("가격낮은순");
});

test("explore feed restores loaded items and scroll after detail back", async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 560 });
  await page.goto("/explore");
  await expect(page.getByRole("heading", { name: "카테고리" })).toBeVisible();
  await expect(page.getByText("유기농 바나나 1송이")).toBeVisible();

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
  await expect(page.getByText("생연어 스테이크 300g")).toBeVisible();

  await page.getByRole("link", { name: /생연어 스테이크 300g/ }).click();
  await expect(page).toHaveURL(/\/products\//);
  await expect(
    page.getByRole("heading", { name: "생연어 스테이크 300g" }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/explore/);
  await expect(page.getByText("생연어 스테이크 300g")).toBeVisible();
});
