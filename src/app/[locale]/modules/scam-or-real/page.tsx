import { placeholderMetadata, PlaceholderRoutePage } from "@/components/layout/PlaceholderRoutePage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return placeholderMetadata("scam-or-real", (await params).locale);
}

export default async function ScamOrRealPage({ params }: { params: Promise<{ locale: string }> }) {
  return <PlaceholderRoutePage route="scam-or-real" locale={(await params).locale} />;
}
