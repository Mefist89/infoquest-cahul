import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

type AuthLocale = "ru" | "ro";

const content = {
  ru: {
    title: "Вход в InfoQuest",
    description: "Войдите, чтобы начать расследование и сохранить игровой прогресс.",
    back: "Вернуться на главную",
    eyebrow: "Доступ к расследованию",
    benefits: ["Без отдельного пароля", "Безопасный вход через Google", "Один аккаунт для игрового прогресса"],
    note: "Мы получим только основные данные профиля: имя, адрес электронной почты и изображение аккаунта.",
    privacy: "Политика конфиденциальности",
    terms: "Условия использования",
    agreement: "Продолжая, вы соглашаетесь с условиями проекта.",
  },
  ro: {
    title: "Autentificare în InfoQuest",
    description: "Autentifică-te pentru a începe investigația și a salva progresul jocului.",
    back: "Înapoi la pagina principală",
    eyebrow: "Acces la investigație",
    benefits: ["Fără o parolă separată", "Autentificare sigură prin Google", "Un cont pentru progresul jocului"],
    note: "Vom primi doar datele de bază ale profilului: numele, adresa de e-mail și imaginea contului.",
    privacy: "Politica de confidențialitate",
    terms: "Termeni și condiții",
    agreement: "Continuând, accepți regulile proiectului.",
  },
} satisfies Record<AuthLocale, Record<string, string | string[]>>;

function isLocale(value: string): value is AuthLocale {
  return value === "ru" || value === "ro";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: AuthLocale = locale === "ro" ? "ro" : "ru";
  return {
    title: `${content[lang].title} — InfoQuest`,
    description: content[lang].description as string,
  };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const t = content[locale];

  return (
    <main className="circuit-bg relative min-h-screen overflow-hidden px-4 py-6 sm:py-10">
      <div className="pointer-events-none absolute left-1/2 top-24 size-80 -translate-x-1/2 rounded-full bg-neon/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-neon transition hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t.back as string}
          </Link>
          <nav className="flex rounded-full border border-border bg-card/70 p-1" aria-label="Language">
            {(["ro", "ru"] as const).map((language) => (
              <Link
                key={language}
                href={`/${language}/login`}
                aria-current={locale === language ? "page" : undefined}
                className={`focus-ring rounded-full px-3 py-2 text-xs font-bold uppercase transition ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {language}
              </Link>
            ))}
          </nav>
        </header>

        <section className="mt-8 grid overflow-hidden rounded-3xl border border-neon/30 bg-card/75 shadow-[0_25px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative border-b border-border/70 p-7 sm:p-10 md:border-b-0 md:border-r">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--neon)_17%,transparent),transparent_55%)]" aria-hidden="true" />
            <div className="relative">
              <div className="grid size-14 place-items-center rounded-2xl border border-neon/50 bg-background/70 glow-neon">
                <ShieldCheck className="size-7 text-neon" aria-hidden="true" />
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-neon">{t.eyebrow as string}</p>
              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{t.title as string}</h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">{t.description as string}</p>
              <ul className="mt-8 space-y-4">
                {(t.benefits as string[]).map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-sm font-semibold">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10">
            <div className="mx-auto w-full max-w-sm">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-neon/10 text-neon">
                <LockKeyhole className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-center text-xl font-bold">Google</h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">{t.note as string}</p>
              <div className="mt-7">
                <GoogleSignInButton locale={locale} initialError={query.error === "oauth"} />
              </div>
              <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                {t.agreement as string}{" "}
                <Link href={`/${locale}/privacy`} className="text-neon hover:underline">{t.privacy as string}</Link>
                {" · "}
                <Link href={`/${locale}/terms`} className="text-neon hover:underline">{t.terms as string}</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
