import { placeholderMetadata, PlaceholderRoutePage } from "@/components/layout/PlaceholderRoutePage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return placeholderMetadata("hacked-account", (await params).locale);
}

export default async function HackedAccountPage({ params }: { params: Promise<{ locale: string }> }) {
  return <PlaceholderRoutePage route="hacked-account" locale={(await params).locale} />;
}
