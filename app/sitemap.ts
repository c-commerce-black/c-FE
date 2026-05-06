import type { MetadataRoute } from "next";

import { env } from "@/lib/shared/env";

const staticRoutes = [
  "",
  "/explore",
  "/login",
  "/signup",
  "/alerts",
  "/cart",
  "/account",
  "/seller",
];

function createSiteUrl(route: string) {
  return new URL(route || "/", env.siteUrl).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticRoutes.map((route) => ({
    url: createSiteUrl(route),
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
