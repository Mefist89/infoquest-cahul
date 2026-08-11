import { placeholderMetadata, PlaceholderRoutePage } from "@/components/layout/PlaceholderRoutePage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return placeholderMetadata("map", (await params).locale);
}

export default async function MapPage({ params }: { params: Promise<{ locale: string }> }) {
  return <PlaceholderRoutePage route="map" locale={(await params).locale} />;
}
