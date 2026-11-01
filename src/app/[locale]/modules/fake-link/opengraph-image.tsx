import { moduleSeo } from "@/data/seo";
import { renderSeoImage } from "@/lib/seo-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ru" ? "ru" : "ro";
  return [{ id: "preview", size, contentType, alt: moduleSeo["fake-link"][locale].title }];
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderSeoImage(moduleSeo["fake-link"][locale === "ru" ? "ru" : "ro"].title);
}
