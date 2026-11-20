import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, GraduationCap, ShieldCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { DemoStudentSignIn } from "@/components/auth/DemoStudentSignIn";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";
import { TextSizeButton } from "@/components/layout/TextSizeButton";
import { createClient } from "@/lib/supabase/server";

type DemoLocale = "ru" | "ro";

const content = {
  ru: {
    pageTitle: "Демо-вход для учеников",
    eyebrow: "Школьное демо",
    heading: "Быстрый вход для учеников",
    description: "Введи имя, фамилию и класс, чтобы сразу начать расследования InfoQuest без почты и пароля.",
    back: "На главную",
    formTitle: "Данные ученика",
    formHint: "Прогресс и набранные XP сохранятся в твоём кабинете на время урока.",
    benefits: [
      "Почта и пароль не нужны",
      "Сразу доступны все 4 расследования",
      "XP и бейджи сохраняются в профиле",
    ],
    aiNote: "В демо-режиме AI-помощник Chrono отключён.",
  },
  ro: {
    pageTitle: "Acces demo pentru elevi",
    eyebrow: "Demo pentru clasă",
    heading: "Intrare rapidă pentru elevi",
    description: "Introdu prenumele, numele și clasa pentru a începe imediat investigațiile InfoQuest fără e-mail și parolă.",
    back: "Pagina principală",
    formTitle: "Datele elevului",
    formHint: "Progresul și punctele XP se salvează în cabinetul tău pe durata lecției.",
    benefits: [
      "Nu ai nevoie de e-mail sau parolă",
      "Ai acces imediat la toate cele 4 investigații",
      "Punctele XP și insignele se salvează în profil",
    ],
    aiNote: "În modul demo, asistentul AI Chrono este dezactivat.",
  },
} as const;

function isLocale(value: string): value is DemoLocale {
  return value === "ru" || value === "ro";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: DemoLocale = locale === "ro" ? "ro" : "ru";
  return {
    title: content[lang].pageTitle,
    description: content[lang].description,
    robots: { index: false, follow: false },
  };
}

export default async function DemoRegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (authData.user) {
    redirect(`/${locale}/profile`);
  }

  const t = content[locale];

  return (
    <main className="circuit-bg relative min-h-screen overflow-x-clip px-4 py-6 sm:py-10">
      <div className="pointer-events-none absolute left-1/2 top-24 size-80 -translate-x-1/2 rounded-full bg-neon/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <Link href={`/${locale}`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-neon transition hover:text-foreground">
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            {t.back}
          </Link>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <TextSizeButton locale={locale} />
            <nav className="flex rounded-full border border-border bg-card/70 p-1" aria-label="Language">
              {(["ro", "ru"] as const).map((language) => (
                <LocaleSwitch
                  locale={language}
                  key={language}
                  href={`/${language}/demo`}
                  aria-current={locale === language ? "page" : undefined}
                  className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-2 text-base font-bold uppercase transition ${
                    locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {language}
                </LocaleSwitch>
              ))}
            </nav>
          </div>
        </header>

        <section className="mt-8 grid overflow-hidden rounded-3xl border border-neon/30 bg-card/75 shadow-[0_25px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative border-b border-border/70 p-6 sm:p-10 md:border-b-0 md:border-r">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--neon)_17%,transparent),transparent_55%)]" aria-hidden="true" />
            <div className="relative">
              <div className="grid size-14 place-items-center rounded-2xl border border-neon/50 bg-background/70 glow-neon">
                <ShieldCheck className="size-7 text-neon" aria-hidden="true" />
              </div>
              <p className="mt-7 text-sm font-bold uppercase tracking-[0.22em] text-neon">{t.eyebrow}</p>
              <h1 className="mt-3 break-words text-3xl font-black leading-tight sm:text-4xl">{t.heading}</h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">{t.description}</p>
              <ul className="mt-7 space-y-3.5">
                {t.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-sm font-semibold">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <p className="mt-6 rounded-2xl border border-gold/35 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold">
                {t.aiNote}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10">
            <div className="mx-auto w-full max-w-sm">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-neon/10 text-neon">
                <GraduationCap className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-center text-xl font-bold">{t.formTitle}</h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">{t.formHint}</p>
              <div className="mt-6">
                <DemoStudentSignIn locale={locale} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
