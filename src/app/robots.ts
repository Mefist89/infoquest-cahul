import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_ORIGIN } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/ro", "/ru"],
      disallow: [
        "/api/",
        "/auth/",
        "/ro/admin",
        "/ru/admin",
        "/ro/profile",
        "/ru/profile",
        "/ro/ai-help",
        "/ru/ai-help",
        "/ro/blocked",
        "/ru/blocked",
        "/ro/login",
        "/ru/login",
        "/ro/results",
        "/ru/results",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_ORIGIN,
  };
}
