import { placeholderMetadata, PlaceholderRoutePage } from "@/components/layout/PlaceholderRoutePage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return placeholderMetadata("fake-link", (await params).locale);
}

export default async function FakeLinkPage({ params }: { params: Promise<{ locale: string }> }) {
  return <PlaceholderRoutePage route="fake-link" locale={(await params).locale} />;
}
