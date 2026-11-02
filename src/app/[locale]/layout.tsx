import type { Metadata } from "next";
import "../globals.css";
import { Orbitron, Rubik } from "next/font/google";
import { ScrollToTop } from "@/components/ScrollToTop";
import { TextSizePreference } from "@/components/layout/TextSizePreference";
import { siteSeo } from "@/data/seo";
import { SITE_ORIGIN } from "@/lib/site";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  variable: "--font-rubik",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === "ru" ? "ru" : "ro";
  return {
    metadataBase: new URL(SITE_ORIGIN),
    applicationName: "InfoQuest",
    title: { default: "InfoQuest", template: "%s | InfoQuest" },
    description: siteSeo[lang].description,
    openGraph: {
      type: "website",
      siteName: "InfoQuest",
      locale: siteSeo[lang].locale,
      alternateLocale: siteSeo[lang].alternateLocale,
    },
    twitter: { card: "summary_large_image" },
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
  };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = locale === "ro" ? "ro" : "ru";

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${orbitron.variable} ${rubik.variable}`}>
      <body>
        <TextSizePreference />
        {children}
        <ScrollToTop locale={lang} />
      </body>
    </html>
  );
}
