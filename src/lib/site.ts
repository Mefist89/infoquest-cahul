export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://infoquest-cahul.vercel.app").replace(/\/+$/u, "");

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_ORIGIN}/`).toString();
}

export function localizedAlternates(path: string, locale: "ro" | "ru") {
  return {
    canonical: absoluteUrl(`/${locale}${path}`),
    languages: {
      ro: absoluteUrl(`/ro${path}`),
      ru: absoluteUrl(`/ru${path}`),
      "x-default": absoluteUrl(`/ro${path}`),
    },
  };
}
