"use client";

import { ArrowRight, GraduationCap, Loader2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type DemoLocale = "ru" | "ro";

const copy = {
  ru: {
    firstNameLabel: "Имя",
    firstNamePlaceholder: "Например, Анна",
    lastNameLabel: "Фамилия",
    lastNamePlaceholder: "Например, Попова",
    classLabel: "Класс",
    classPlaceholder: "Например, 7А",
    submit: "Начать расследование",
    submitting: "Создаём профиль...",
    validationError: "Пожалуйста, заполни имя, фамилию и класс.",
    networkError: "Ошибка сети. Проверь интернет и попробуй снова.",
  },
  ro: {
    firstNameLabel: "Prenume",
    firstNamePlaceholder: "De exemplu, Ana",
    lastNameLabel: "Nume",
    lastNamePlaceholder: "De exemplu, Popa",
    classLabel: "Clasa",
    classPlaceholder: "De exemplu, 7A",
    submit: "Începe investigația",
    submitting: "Creăm profilul...",
    validationError: "Te rog completează prenumele, numele și clasa.",
    networkError: "Eroare de rețea. Verifică internetul și încearcă din nou.",
  },
} as const;

export function DemoStudentSignIn({ locale }: { locale: DemoLocale }) {
  const router = useRouter();
  const t = copy[locale];
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanClass = schoolClass.trim();

    if (!cleanFirst || !cleanLast || !cleanClass) {
      setError(t.validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/demo-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: cleanFirst,
          lastName: cleanLast,
          schoolClass: cleanClass,
          locale,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; redirectTo?: string; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error || t.networkError);
        setSubmitting(false);
        return;
      }

      router.push(payload.redirectTo || `/${locale}/profile`);
      router.refresh();
    } catch {
      setError(t.networkError);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="demo-first-name" className="mb-1.5 block text-sm font-bold text-foreground">
          {t.firstNameLabel}
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="demo-first-name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            maxLength={60}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder={t.firstNamePlaceholder}
            disabled={submitting}
            className="focus-ring min-h-12 w-full rounded-xl border border-border bg-background/70 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground/70 transition focus:border-neon"
          />
        </div>
      </div>

      <div>
        <label htmlFor="demo-last-name" className="mb-1.5 block text-sm font-bold text-foreground">
          {t.lastNameLabel}
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="demo-last-name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            maxLength={60}
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder={t.lastNamePlaceholder}
            disabled={submitting}
            className="focus-ring min-h-12 w-full rounded-xl border border-border bg-background/70 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground/70 transition focus:border-neon"
          />
        </div>
      </div>

      <div>
        <label htmlFor="demo-school-class" className="mb-1.5 block text-sm font-bold text-foreground">
          {t.classLabel}
        </label>
        <div className="relative">
          <GraduationCap className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="demo-school-class"
            name="schoolClass"
            type="text"
            required
            maxLength={24}
            value={schoolClass}
            onChange={(event) => setSchoolClass(event.target.value)}
            placeholder={t.classPlaceholder}
            disabled={submitting}
            className="focus-ring min-h-12 w-full rounded-xl border border-border bg-background/70 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground/70 transition focus:border-neon"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neon px-5 py-3 text-base font-black text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            {t.submitting}
          </>
        ) : (
          <>
            {t.submit}
            <ArrowRight className="size-5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
