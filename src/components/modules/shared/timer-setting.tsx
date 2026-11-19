"use client";

import { noTimerStore } from "@/features/modules/runner/no-timer-store";
import { useNoTimer } from "@/features/modules/runner/use-no-timer";

type TimerLocale = "ru" | "ro";

export function NoTimerToggle({ locale }: { locale: TimerLocale }) {
  const noTimer = useNoTimer();
  return (
    <label className="focus-within:ring-2 focus-within:ring-neon focus-within:ring-offset-2 focus-within:ring-offset-background flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card/70 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-neon/50">
      <input
        type="checkbox"
        role="switch"
        checked={noTimer}
        onChange={event => noTimerStore.setValue(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border bg-secondary/80 transition-colors peer-checked:border-neon peer-checked:bg-neon/25"
      >
        <span
          className={`inline-block size-4 rounded-full transition-transform ${
            noTimer
              ? "translate-x-5 bg-neon shadow-[0_0_10px_rgba(0,217,255,0.6)]"
              : "translate-x-1 bg-muted-foreground"
          }`}
        />
      </span>
      <span>{locale === "ru" ? "Без таймера" : "Fără cronometru"}</span>
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
