"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Sparkles } from "lucide-react";

type GateLocale = "ru" | "ro";

const copy = {
  ru: {
    eyebrow: "Отличное начало!",
    title: "Зарегистрируйся, чтобы продолжить с 5\u2011го этапа",
    description:
      "Ты уже прошёл первые 4 этапа модуля без регистрации. Войди или создай аккаунт — мы автоматически сохраним твой прогресс и откроем этапы 5–8 и финальную схватку.",
    benefits: [
      "Пройденные этапы 1–4 перенесутся в твой профиль сразу после входа",
      "Откроются этапы 5–8, финальная схватка с Тенью и другие расследования",
      "Ты получишь XP, бейдж модуля и доступ к AI-помощнику Chrono",
    ],
    cta: "Войти или зарегистрироваться",
    review: "Вернуться к этапам 1–4",
    completedLabel: (count: number) => `Пройдено этапов: ${count} из 4 пробных`,
  },
  ro: {
    eyebrow: "Început excelent!",
    title: "Înregistrează-te pentru a continua din etapa 5",
    description:
      "Ai parcurs deja primele 4 etape ale modulului fără înregistrare. Intră în cont sau creează unul — îți salvăm automat progresul și deblocăm etapele 5–8 și confruntarea finală.",
    benefits: [
      "Etapele 1–4 parcurse se transferă automat în profilul tău după autentificare",
      "Se deblochează etapele 5–8, confruntarea finală cu Umbra și celelalte investigații",
      "Primești XP, insigna modulului și acces la asistentul AI Chrono",
    ],
    cta: "Intră în cont sau înregistrează-te",
    review: "Înapoi la etapele 1–4",
    completedLabel: (count: number) => `Etape parcurse: ${count} din 4 de probă`,
  },
} as const;

export function GuestRegisterGate({
  locale,
  loginHref,
  completedCount,
  onReviewStages,
}: {
  locale: GateLocale;
  loginHref: string;
  completedCount: number;
  onReviewStages: () => void;
}) {
  const t = copy[locale];

  return (
    <div
      data-testid="guest-register-gate"
      className="mx-auto max-w-2xl rounded-3xl border border-neon/40 bg-background/60 p-6 text-center shadow-[0_20px_70px_rgba(0,217,255,0.12)] sm:p-8"
    >
      <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-neon/45 bg-neon/10 text-neon">
        <Lock className="size-8" aria-hidden="true" />
      </span>

      <p className="mt-4 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-1.5 text-center text-sm font-bold text-gold">
        <Sparkles className="size-4 shrink-0" aria-hidden="true" />
        <span>{t.eyebrow} · {t.completedLabel(completedCount)}</span>
      </p>

      <h2 className="mt-4 text-2xl font-black text-foreground sm:text-3xl">{t.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{t.description}</p>

      <ul className="mt-6 space-y-2.5 rounded-2xl border border-border bg-card/60 p-4 text-left text-sm text-foreground">
        {t.benefits.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={loginHref}
          className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-neon px-6 py-3 text-base font-black text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.3)] transition hover:-translate-y-0.5"
        >
          {t.cta}
          <ArrowRight className="size-5" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={onReviewStages}
          className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card/70 px-5 py-3 text-sm font-bold text-muted-foreground transition hover:border-neon/60 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.review}
        </button>
      </div>
    </div>
  );
}
