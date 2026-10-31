"use client";

import { noTimerStore } from "@/features/modules/runner/no-timer-store";
import { useNoTimer } from "@/features/modules/runner/use-no-timer";

type TimerLocale = "ru" | "ro";

export function NoTimerToggle({ locale }: { locale: TimerLocale }) {
  const noTimer = useNoTimer();
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm font-semibold text-foreground">
      <input type="checkbox" role="switch" checked={noTimer} onChange={event => noTimerStore.setValue(event.target.checked)} className="focus-ring size-5 shrink-0 accent-[var(--neon)]" />
      {locale === "ru" ? "Без таймера" : "Fără cronometru"}
    </label>
  );
}

export function TimerGameStart({ locale, onStart }: { locale: TimerLocale; onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-background/40 p-6">
      <NoTimerToggle locale={locale} />
      <button type="button" onClick={onStart} className="focus-ring min-h-12 rounded-xl bg-neon px-8 py-3 text-base font-black text-primary-foreground">{locale === "ru" ? "Начать" : "Începe"}</button>
    </div>
  );
}
