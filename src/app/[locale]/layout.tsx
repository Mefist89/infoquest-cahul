import type { Metadata } from "next";
import "../globals.css";
import { Orbitron, Rubik } from "next/font/google";
import { ScrollToTop } from "@/components/ScrollToTop";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "InfoQuest — Щит цифрового сообщества",
  description:
    "Двуязычная образовательная игра о цифровой безопасности, мошенничестве, дипфейках и дезинформации.",
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = locale === "ro" ? "ro" : "ru";

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${orbitron.variable} ${rubik.variable}`}>
      <body>
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
