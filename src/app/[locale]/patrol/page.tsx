import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PatrolGameLoader } from "@/components/game/PatrolGameLoader";

function isLocale(locale: string): locale is "ru" | "ro" {
  return locale === "ru" || locale === "ro";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${locale === "ro" ? "Patrula orașului digital" : "Патруль цифрового города"} — InfoQuest`,
    description:
      locale === "ro" ? "Mini-joc 2D: patrulează orașul și oprește amenințările." : "Мини-игра 2D: патрулируй город и останавливай угрозы.",
  };
}

export default async function PatrolPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main className="circuit-bg min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center gap-3">
          <Link href={`/${locale}`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-neon transition hover:border-neon/60">
            <ArrowLeft className="size-4" aria-hidden="true" /> {locale === "ro" ? "Acasă" : "На главную"}
          </Link>
          <nav className="flex rounded-full border border-border bg-card/70 p-1" aria-label="Language">
            {(["ro", "ru"] as const).map((language) => (
              <Link key={language} href={`/${language}/patrol`} className={`focus-ring rounded-full px-3 py-2 text-xs font-bold uppercase ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground"}`}>
                {language}
              </Link>
            ))}
          </nav>
        </header>

        <section className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neon">InfoQuest · 2D</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {locale === "ro" ? "Patrula orașului digital" : "Патруль цифрового города"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {locale === "ro"
              ? "Mergi prin cartiere cu WASD sau săgeți, apropie-te de locuitori și apasă E pentru dialog."
              : "Ходи по районам на WASD или стрелках, подходи к жителям и жми E для разговора."}
          </p>
        </section>

        <section className="mt-6">
          <PatrolGameLoader locale={locale} />
        </section>
      </div>
    </main>
  );
}
