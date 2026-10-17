"use client";

import { useState } from "react";
import { Check, Lock, ShieldAlert } from "lucide-react";

import type { fakeLinkContent, FakeLinkLocale } from "@/data/fake-link";
import type { StageResult } from "@/features/modules/runner/use-module-runner";

type FindSignalsContent =
  | (typeof fakeLinkContent)["ru"]["findSignals"]
  | (typeof fakeLinkContent)["ro"]["findSignals"];

const SIGNAL_COUNT = 6;
const PASS_COUNT = 4;

function Hotspot({
  zone,
  found,
  revealed,
  disabled,
  onToggle,
}: {
  zone: string;
  found: boolean;
  revealed: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      aria-pressed={found}
      aria-label={zone}
      className={`focus-ring absolute inset-0 rounded-lg transition ${
        found
          ? "bg-neon/15 outline outline-2 outline-neon"
          : revealed
            ? "bg-danger/10 outline outline-2 outline-dashed outline-danger/70"
            : "outline outline-1 outline-dashed outline-neon/30 hover:bg-neon/10 hover:outline-neon/70"
      }`}
    >
      {found && (
        <span aria-hidden="true" className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-neon text-primary-foreground">
          <Check className="size-4" />
        </span>
      )}
    </button>
  );
}

export function FindSignalsStage({
  locale,
  content,
  checkLabel,
  retryLabel,
  saving,
  onComplete,
}: {
  locale: FakeLinkLocale;
  content: FindSignalsContent;
  checkLabel: string;
  retryLabel: string;
  saving: boolean;
  onComplete: (result: StageResult) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);

  const zoneWord = locale === "ro" ? "Zona" : "Зона";
  const foundCount = selected.size;

  function toggle(id: string) {
    if (submitted || saving) return;
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    if (saving) return;
    if (foundCount >= PASS_COUNT) {
      setPassed(true);
      setSubmitted(true);
      onComplete({ correct: foundCount, total: SIGNAL_COUNT });
    } else {
      setSubmitted(true);
    }
  }

  function retry() {
    setSelected(new Set());
    setSubmitted(false);
  }

  return (
    <div>
      <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">{content.lead}</p>
      <p className="mt-2 text-sm font-semibold text-neon">{content.passNote}</p>

      {/* Поддельный сайт: мокап окна браузера на чистом CSS, без картинок. */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background/60">
        <div className="flex items-center gap-2 border-b border-border bg-card/70 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-danger/70" />
            <span className="size-2.5 rounded-full bg-gold/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
          </span>
          <span className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-background/60 px-3 py-1.5 font-mono text-xs text-muted-foreground sm:text-sm">
            <span className="relative shrink-0">
              <Lock className="size-3.5 text-danger" aria-hidden="true" />
              <Hotspot zone={`${zoneWord} 2`} found={selected.has("no-https")} revealed={submitted && !selected.has("no-https")} disabled={submitted || saving} onToggle={() => toggle("no-https")} />
            </span>
            <span className="relative truncate">
              http://banca-noroc-online.com/login
              <Hotspot zone={`${zoneWord} 1`} found={selected.has("domain")} revealed={submitted && !selected.has("domain")} disabled={submitted || saving} onToggle={() => toggle("domain")} />
            </span>
          </span>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="relative inline-block rounded-lg bg-secondary/60 px-4 py-2">
              <span className="text-lg font-black tracking-wide text-foreground blur-[2px]" aria-hidden="true">Banca Noroc</span>
              <Hotspot zone={`${zoneWord} 4`} found={selected.has("logo")} revealed={submitted && !selected.has("logo")} disabled={submitted || saving} onToggle={() => toggle("logo")} />
            </span>
            <span className="hidden gap-2 sm:flex" aria-hidden="true">
              <span className="h-2 w-10 rounded bg-secondary" />
              <span className="h-2 w-10 rounded bg-secondary" />
              <span className="h-2 w-10 rounded bg-secondary" />
            </span>
          </div>

          <div className="relative rounded-xl border border-danger/50 bg-danger/10 p-3 text-center">
            <p className="text-sm font-black text-danger sm:text-base">
              {locale === "ro" ? "Contul tău va fi blocat! Conectează-te în 10 minute!" : "Твой аккаунт будет заблокирован! Войди в течение 10 минут!"}
            </p>
            <Hotspot zone={`${zoneWord} 3`} found={selected.has("urgency")} revealed={submitted && !selected.has("urgency")} disabled={submitted || saving} onToggle={() => toggle("urgency")} />
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4">
            <p className="text-sm font-bold text-foreground">{locale === "ro" ? "Conectare la cont" : "Вход в аккаунт"}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <span className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground">{locale === "ro" ? "Utilizator" : "Логин"}</span>
              <span className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground">••••••••</span>
              <span className="relative rounded-lg border border-danger/50 bg-danger/5 px-3 py-2 text-sm text-muted-foreground sm:col-span-2">
                {locale === "ro" ? "PIN card + CVV (obligatoriu)" : "PIN карты + CVV (обязательно)"}
                <Hotspot zone={`${zoneWord} 5`} found={selected.has("form")} revealed={submitted && !selected.has("form")} disabled={submitted || saving} onToggle={() => toggle("form")} />
              </span>
            </div>
            <span className="mt-3 block rounded-xl bg-secondary/70 px-4 py-2.5 text-center text-sm font-bold text-muted-foreground">
              {locale === "ro" ? "Intră în cont" : "Войти"}
            </span>
          </div>

          <div className="relative">
            <div aria-hidden="true" className={`rounded-xl border px-4 py-3 text-center text-sm font-black transition ${selected.has("prize") ? "border-neon bg-neon/15 text-neon" : "border-gold/50 bg-gold/10 text-gold"}`}>
              {locale === "ro" ? "Ai câștigat un telefon! Ridică premiul" : "Ты выиграл телефон! Забрать приз"}
            </div>
            <Hotspot
              zone={`${zoneWord} 6`}
              found={selected.has("prize")}
              revealed={submitted && !selected.has("prize")}
              disabled={submitted || saving}
              onToggle={() => toggle("prize")}
            />
          </div>
        </div>
      </div>

      <div aria-live="polite" className="mt-6">
        {submitted ? (
          <div className={`rounded-2xl border p-5 ${passed ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
            <p className={`flex items-center gap-2 text-base font-black ${passed ? "text-success" : "text-danger"}`}>
              <ShieldAlert className="size-5" aria-hidden="true" />
              {passed ? content.successTitle : content.failTitle}
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">{content.foundCount.replace("{found}", String(foundCount))}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {content.signals.map((signal) => {
                const hit = selected.has(signal.id);
                return (
                  <li key={signal.id} className={`rounded-xl border p-3 text-sm ${hit ? "border-success/40 bg-success/5" : "border-border bg-background/40"}`}>
                    <p className="font-bold text-foreground">
                      {hit ? <Check className="mr-1 inline size-4 text-success" aria-hidden="true" /> : null}
                      {signal.title}
                    </p>
                    <p className="mt-1 text-muted-foreground">{signal.explain}</p>
                  </li>
                );
              })}
            </ul>
            {!passed && (
              <button type="button" onClick={retry} className="focus-ring mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5">
                {retryLabel}
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={saving || foundCount === 0}
            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {checkLabel} ({foundCount}/{SIGNAL_COUNT})
          </button>
        )}
      </div>
    </div>
  );
}
