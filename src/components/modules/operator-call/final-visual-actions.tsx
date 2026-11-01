"use client";

import { CheckCircle2, Info, MessageCircle, Phone, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import type { OperatorLocale } from "@/data/operator-call";

const labels = {
  ru: {
    decline: "Сбросить звонок",
    answer: "Ответить на звонок",
    call: "Позвонить",
    message: "Написать",
    safe: "Правильно: положить трубку — безопасное действие. Теперь найди признаки обмана в карточке звонка.",
    wrong: "Неверно. В этом задании не нужно отвечать на подозрительный звонок. Найди признаки обмана в карточке.",
    hint: "Это учебный макет: звонить или писать не нужно. Найди подозрительные детали в карточке.",
  },
  ro: {
    decline: "Respinge apelul",
    answer: "Răspunde la apel",
    call: "Sună",
    message: "Scrie",
    safe: "Corect: să închizi apelul este o acțiune sigură. Acum găsește semnele înșelătoriei în fișa apelului.",
    wrong: "Incorect. În această sarcină nu trebuie să răspunzi la apelul suspect. Găsește semnele înșelătoriei în fișă.",
    hint: "Acesta este un model educațional: nu trebuie să suni sau să scrii. Găsește detaliile suspecte din fișă.",
  },
} as const;

type Props = { locale: OperatorLocale } & (
  { kind: "call"; onAnswer: () => void } | { kind: "profile"; onAnswer?: never }
);

/** Only answering a suspicious call reports an error to the game. */
export function FinalVisualActions({ locale, kind, onAnswer }: Props) {
  const [action, setAction] = useState<"decline" | "answer" | "other" | null>(null);
  const [answerUsed, setAnswerUsed] = useState(false);
  const answeredRef = useRef(false);
  const t = labels[locale];
  const safe = action === "decline";
  const wrong = action === "answer";
  const answerCall = () => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setAnswerUsed(true);
    setAction("answer");
    onAnswer?.();
  };
  return (
    <div className="w-full">
      {kind === "call" ? (
        <div className="mt-12 flex w-full justify-center gap-8">
          <button type="button" aria-label={t.decline} onClick={() => setAction("decline")} className="focus-ring grid min-h-14 w-14 min-w-11 place-items-center rounded-full bg-danger shadow-lg"><Phone className="rotate-[135deg] text-white" aria-hidden="true" /></button>
          <button type="button" aria-label={t.answer} disabled={answerUsed} onClick={answerCall} className="focus-ring grid min-h-14 w-14 min-w-11 place-items-center rounded-full bg-success shadow-lg disabled:opacity-50"><Phone className="text-white" aria-hidden="true" /></button>
        </div>
      ) : (
        <div className="flex w-full justify-around border-t border-slate-300 pt-4 dark:border-slate-800">
          <button type="button" onClick={() => setAction("other")} className="focus-ring flex min-h-11 min-w-11 flex-col items-center rounded-xl p-2 text-neon"><Phone className="mb-1 size-6" aria-hidden="true" /><span className="text-base">{t.call}</span></button>
          <button type="button" onClick={() => setAction("other")} className="focus-ring flex min-h-11 min-w-11 flex-col items-center rounded-xl p-2 text-neon"><MessageCircle className="mb-1 size-6" aria-hidden="true" /><span className="text-base">{t.message}</span></button>
        </div>
      )}
      <div role="status" aria-live="polite" aria-atomic="true">
        {action && <p className={`mt-4 rounded-xl border p-3 text-base leading-relaxed text-slate-800 dark:text-slate-100 ${safe ? "border-success/40 bg-success/10" : wrong ? "border-danger/40 bg-danger/10" : "border-neon/40 bg-neon/10"}`}>
          {safe ? <CheckCircle2 className="mr-2 inline size-5" aria-hidden="true" /> : wrong ? <XCircle className="mr-2 inline size-5" aria-hidden="true" /> : <Info className="mr-2 inline size-5" aria-hidden="true" />}
          {safe ? t.safe : wrong ? t.wrong : t.hint}
        </p>}
      </div>
    </div>
  );
}
