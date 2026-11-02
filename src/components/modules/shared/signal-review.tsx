"use client";

import { Check, X } from "lucide-react";

export const signalLabels = {
  ru: { correct: "Верно", wrong: "Неверно", normal: "Обычная деталь", suspicious: "Подозрительная деталь", selected: "Найдено", trapClicks: "Нажатий на ловушки", trap: "Это есть и на настоящем сайте" },
  ro: { correct: "Corect", wrong: "Incorect", normal: "Detaliu obișnuit", suspicious: "Detaliu suspect", selected: "Găsite", trapClicks: "Apăsări pe capcane", trap: "Asta există și pe site-ul real" },
} as const;

type Detail = { id: string; title: string; explain: string };

export function SignalTrapFeedback({ locale, detail, count }: { locale: "ru" | "ro"; detail?: Detail; count: number }) {
  const t = signalLabels[locale];
  return <div role="status" aria-live="polite" aria-atomic="true">
    {detail && <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-base">
      <p className="font-bold text-foreground"><X className="mr-2 inline size-5 text-danger" aria-hidden="true" />{t.trap}</p>
      <p className="mt-2 text-foreground">{detail.title}. {detail.explain}</p>
      <p className="mt-2 text-muted-foreground">{t.trapClicks}: {count}</p>
    </div>}
  </div>;
}

export function SignalReview({ locale, content, selected, trapIds, passed, found, trapClicks, retryLabel, saving, onRetry }: {
  locale: "ru" | "ro";
  content: { signals: readonly Detail[]; normalDetails: readonly Detail[]; successTitle: string; failTitle: string; foundCount: string };
  selected: ReadonlySet<string>; trapIds: ReadonlySet<string>; passed: boolean; found: number; trapClicks: number; retryLabel: string; saving: boolean; onRetry: () => void;
}) {
  const t = signalLabels[locale];
  const details = [...content.signals.map(detail => ({ ...detail, suspicious: true })), ...content.normalDetails.map(detail => ({ ...detail, suspicious: false }))];
  return <div className={`rounded-2xl border p-5 ${passed ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
    <p className={`flex items-center gap-2 text-base font-black ${passed ? "text-success" : "text-danger"}`}>{passed ? <Check className="size-5" aria-hidden="true" /> : <X className="size-5" aria-hidden="true" />}{passed ? content.successTitle : content.failTitle}</p>
    <p className="mt-2 text-base font-bold text-foreground">{content.foundCount.replace("{found}", String(found))}</p>
    <p className="mt-1 text-base text-foreground">{t.trapClicks}: {trapClicks}</p>
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">{details.map(detail => {
      const correct = detail.suspicious ? selected.has(detail.id) : !trapIds.has(detail.id);
      return <li key={detail.id} className="rounded-xl border border-border bg-background/40 p-3 text-base">
        <p className={`font-bold ${correct ? "text-success" : "text-danger"}`}>{correct ? <Check className="mr-1 inline size-5" aria-hidden="true" /> : <X className="mr-1 inline size-5" aria-hidden="true" />}{correct ? t.correct : t.wrong} · {detail.suspicious ? t.suspicious : t.normal}</p>
        <p className="mt-2 font-bold text-foreground">{detail.title}</p><p className="mt-1 text-muted-foreground">{detail.explain}</p>
      </li>;
    })}</ul>
    {!passed && <button type="button" onClick={onRetry} disabled={saving} className="focus-ring mt-4 inline-flex min-h-12 min-w-11 items-center rounded-xl bg-neon px-6 text-base font-black text-primary-foreground disabled:opacity-60">{retryLabel}</button>}
  </div>;
}
