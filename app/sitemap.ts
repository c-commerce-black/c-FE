import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticRoutes.map((route) => ({
    url: `${env.siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
