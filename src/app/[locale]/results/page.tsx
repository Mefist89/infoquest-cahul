import { placeholderMetadata, PlaceholderRoutePage } from "@/components/layout/PlaceholderRoutePage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return placeholderMetadata("results", (await params).locale);
}

export default async function ResultsPage({ params }: { params: Promise<{ locale: string }> }) {
  return <PlaceholderRoutePage route="results" locale={(await params).locale} />;
}
