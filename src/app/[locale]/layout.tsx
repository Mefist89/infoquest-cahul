import type { Metadata } from "next";
import "../globals.css";
import { Orbitron, Rubik } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "InfoQuest Cahul — Щит цифрового сообщества",
  description:
    "Двуязычная образовательная игра о цифровой безопасности, мошенничестве, дипфейках и дезинформации.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${orbitron.variable} ${rubik.variable}`}>
      <body>{children}</body>
    </html>
  );
}
