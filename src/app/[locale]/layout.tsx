import type { Metadata } from "next";
import "../globals.css";
import { Orbitron, Rubik } from "next/font/google";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SITE_ORIGIN } from "@/lib/site";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: "InfoQuest",
  title: {
    default: "InfoQuest",
    template: "%s | InfoQuest",
  },
  description: "Bilingual digital safety education for the Cahul community.",
  openGraph: {
    type: "website",
    siteName: "InfoQuest",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = locale === "ro" ? "ro" : "ru";

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${orbitron.variable} ${rubik.variable}`}>
      <body>
        {children}
        <ScrollToTop locale={lang} />
      </body>
    </html>
  );
}
