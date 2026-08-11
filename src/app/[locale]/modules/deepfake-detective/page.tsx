import { placeholderMetadata, PlaceholderRoutePage } from "@/components/layout/PlaceholderRoutePage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return placeholderMetadata("deepfake-detective", (await params).locale);
}

export default async function DeepfakeDetectivePage({ params }: { params: Promise<{ locale: string }> }) {
  return <PlaceholderRoutePage route="deepfake-detective" locale={(await params).locale} />;
}
