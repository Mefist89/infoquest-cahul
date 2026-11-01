"use client";

import { CheckCircle2, Info, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import type { OperatorLocale } from "@/data/operator-call";

const labels = {
  ru: {
    decline: "Сбросить звонок",
    answer: "Ответить на звонок",
    call: "Позвонить",
    message: "Написать",
    safe: "Безопасно: положить трубку. Теперь найди признаки обмана в карточке звонка.",
    hint: "Это учебный макет: звонить или писать не нужно. Найди подозрительные детали в карточке.",
  },
  ro: {
    decline: "Respinge apelul",
    answer: "Răspunde la apel",
    call: "Sună",
    message: "Scrie",
    safe: "Este sigur să închizi apelul. Acum găsește semnele înșelătoriei în fișa apelului.",
    hint: "Acesta este un model educațional: nu trebuie să suni sau să scrii. Găsește detaliile suspecte din fișă.",
  },
} as const;

/** Mock phone controls provide guidance; they cannot change lives or the score. */
export function FinalVisualActions({ locale, kind }: { locale: OperatorLocale; kind: "call" | "profile" }) {
  const [action, setAction] = useState<"decline" | "other" | null>(null);
  const t = labels[locale];
  const safe = action === "decline";
  return (
    <div className="w-full">
      {kind === "call" ? (
        <div className="mt-12 flex w-full justify-center gap-8">
          <button type="button" aria-label={t.decline} onClick={() => setAction("decline")} className="focus-ring grid min-h-14 w-14 min-w-11 place-items-center rounded-full bg-danger shadow-lg"><Phone className="rotate-[135deg] text-white" aria-hidden="true" /></button>
          <button type="button" aria-label={t.answer} onClick={() => setAction("other")} className="focus-ring grid min-h-14 w-14 min-w-11 place-items-center rounded-full bg-success shadow-lg"><Phone className="text-white" aria-hidden="true" /></button>
        </div>
      ) : (
        <div className="flex w-full justify-around border-t border-slate-300 pt-4 dark:border-slate-800">
          <button type="button" onClick={() => setAction("other")} className="focus-ring flex min-h-11 min-w-11 flex-col items-center rounded-xl p-2 text-neon"><Phone className="mb-1 size-6" aria-hidden="true" /><span className="text-base">{t.call}</span></button>
          <button type="button" onClick={() => setAction("other")} className="focus-ring flex min-h-11 min-w-11 flex-col items-center rounded-xl p-2 text-neon"><MessageCircle className="mb-1 size-6" aria-hidden="true" /><span className="text-base">{t.message}</span></button>
        </div>
      )}
      <div role="status" aria-live="polite" aria-atomic="true">
        {action && <p className={`mt-4 rounded-xl border p-3 text-base leading-relaxed ${safe ? "border-success/40 bg-success/10 text-slate-800 dark:text-slate-100" : "border-neon/40 bg-neon/10 text-slate-800 dark:text-slate-100"}`}>
          {safe ? <CheckCircle2 className="mr-2 inline size-5" aria-hidden="true" /> : <Info className="mr-2 inline size-5" aria-hidden="true" />}
          {safe ? t.safe : t.hint}
        </p>}
      </div>
    </div>
  );
}
