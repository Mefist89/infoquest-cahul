import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

const localizedPaths = ["", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return localizedPaths.flatMap((path) => (["ro", "ru"] as const).map((lang) => ({
    url: absoluteUrl(`/${lang}${path}`),
    changeFrequency: path === "" ? "weekly" as const : "yearly" as const,
    priority: path === "" ? 1 : 0.4,
    alternates: {
      languages: {
        ro: absoluteUrl(`/ro${path}`),
        ru: absoluteUrl(`/ru${path}`),
        "x-default": absoluteUrl(`/ro${path}`),
      },
    },
  })));
}
