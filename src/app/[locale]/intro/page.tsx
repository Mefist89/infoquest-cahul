import { placeholderMetadata, PlaceholderRoutePage } from "@/components/layout/PlaceholderRoutePage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return placeholderMetadata("intro", (await params).locale);
}

export default async function IntroPage({ params }: { params: Promise<{ locale: string }> }) {
  return <PlaceholderRoutePage route="intro" locale={(await params).locale} />;
}
