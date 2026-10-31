"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { OperatorLocale } from "@/data/operator-call";
import type { RetryFeedback } from "@/features/modules/runner/retry-progress";

export function StageRetryFeedback({ locale, feedback, retry = false, onContinue }: {
  locale: OperatorLocale; feedback: RetryFeedback; retry?: boolean; onContinue: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => { panelRef.current?.focus(); }, [feedback]);
  const correctLabel = locale === "ru" ? "Верно" : "Corect";
  const wrongLabel = locale === "ru" ? "Неверно" : "Incorect";
  const nextLabel = locale === "ru" ? "Дальше" : "Continuă";
  const retryLabel = locale === "ru" ? "Попробовать ещё раз" : "Încearcă din nou";
  const Icon = feedback.correct ? Check : X;
  return (
    <div ref={panelRef} tabIndex={-1} role="status" aria-live="polite" className="focus-ring w-full rounded-2xl border border-border bg-slate-950 p-5 text-center sm:p-7">
      <p className={`flex items-center justify-center gap-3 text-2xl font-black ${feedback.correct ? "text-success" : "text-danger"}`}>
        <Icon className="size-8 shrink-0" aria-hidden="true" />{feedback.correct ? correctLabel : wrongLabel}
      </p>
      <p className="mt-4 text-lg leading-relaxed text-foreground">{feedback.explanation}</p>
      <button type="button" onClick={onContinue} className="focus-ring mt-6 min-h-12 rounded-xl bg-neon px-6 py-3 text-base font-black text-primary-foreground">{retry ? retryLabel : nextLabel}</button>
    </div>
  );
}
