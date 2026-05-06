import type { MetadataRoute } from "next";

import { env } from "@/lib/shared/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = new URL(env.siteUrl);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl.origin,
  };
}
