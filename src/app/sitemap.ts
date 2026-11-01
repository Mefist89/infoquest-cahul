import type { MetadataRoute } from "next";

import { moduleSeo } from "@/data/seo";
import { absoluteUrl } from "@/lib/site";

const localizedPaths = ["", "/privacy", "/terms", "/patrol", ...Object.keys(moduleSeo).map(module => `/modules/${module}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = localizedPaths.flatMap((path) => (["ro", "ru"] as const).map((lang) => ({
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
  return [...pages, ...(["ro", "ru"] as const).map(locale => ({
    url: absoluteUrl(`/ghid_${locale}.pdf`),
    changeFrequency: "yearly" as const,
    priority: 0.3,
    alternates: { languages: { ro: absoluteUrl("/ghid_ro.pdf"), ru: absoluteUrl("/ghid_ru.pdf"), "x-default": absoluteUrl("/ghid_ro.pdf") } },
  }))];
}
