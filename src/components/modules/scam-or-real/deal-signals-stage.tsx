"use client";

import { useState } from "react";
import { Check, ShieldAlert, Timer } from "lucide-react";

import type { scamOrRealContent, ScamOrRealLocale } from "@/data/scam-or-real";
import type { StageResult } from "@/features/modules/runner/use-module-runner";

type DealSignalsContent =
  | (typeof scamOrRealContent)["ru"]["dealSignals"]
  | (typeof scamOrRealContent)["ro"]["dealSignals"];

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

export function DealSignalsStage({
  locale,
  content,
  checkLabel,
  retryLabel,
  saving,
  onComplete,
}: {
  locale: ScamOrRealLocale;
  content: DealSignalsContent;
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

      {/* Объявление мошенников: мокап карточки товара на чистом CSS, без картинок. */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background/60">
        <div className="border-b border-border bg-card/70 px-4 py-2">
          <p className="truncate text-sm font-bold text-foreground sm:text-base">
            {locale === "ro" ? "Telefon Ultra X — NOU! Reducere −50%" : "Телефон Ультра X — НОВЫЙ! Скидка −50%"}
          </p>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <div className="relative rounded-xl border border-danger/50 bg-danger/10 p-3 text-center">
            <p className="flex items-center justify-center gap-2 text-sm font-black text-danger sm:text-base">
              <Timer className="size-4" aria-hidden="true" />
              {locale === "ro" ? "Oferta expiră în 04:59! Au rămas 2 bucăți!" : "Скидка сгорит через 04:59! Осталось 2 штуки!"}
            </p>
            <Hotspot zone={`${zoneWord} 4`} found={selected.has("urgency")} revealed={submitted && !selected.has("urgency")} disabled={submitted || saving} onToggle={() => toggle("urgency")} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative grid min-h-40 place-items-center overflow-hidden rounded-xl border border-border bg-secondary/40">
              <span aria-hidden="true" className="px-4 text-center text-4xl font-black tracking-widest text-muted-foreground blur-[3px]">ULTRA X</span>
              <Hotspot zone={`${zoneWord} 6`} found={selected.has("photo")} revealed={submitted && !selected.has("photo")} disabled={submitted || saving} onToggle={() => toggle("photo")} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="relative rounded-xl border border-gold/50 bg-gold/10 p-3 text-center">
                <p className="text-xs text-muted-foreground line-through">12000 {locale === "ro" ? "lei" : "леев"}</p>
                <p className="text-2xl font-black text-gold">5999 {locale === "ro" ? "lei" : "леев"}</p>
                <Hotspot zone={`${zoneWord} 1`} found={selected.has("price")} revealed={submitted && !selected.has("price")} disabled={submitted || saving} onToggle={() => toggle("price")} />
              </div>
              <div className="relative rounded-xl border border-border bg-card/60 p-3">
                <p className="text-sm font-bold text-foreground">MagazinSuper_2026</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {locale === "ro" ? "Pe site de 6 zile · 0 recenzii" : "На сайте 6 дней · 0 отзывов"}
                </p>
                <Hotspot zone={`${zoneWord} 3`} found={selected.has("seller")} revealed={submitted && !selected.has("seller")} disabled={submitted || saving} onToggle={() => toggle("seller")} />
              </div>
            </div>
          </div>

          <div className="relative rounded-xl border border-danger/50 bg-danger/5 p-3">
            <p className="text-sm font-bold text-foreground">
              {locale === "ro" ? "Plată 100% în avans pe cardul vânzătorului" : "Оплата 100% вперёд на карту продавца"}
            </p>
            <Hotspot zone={`${zoneWord} 2`} found={selected.has("prepay")} revealed={submitted && !selected.has("prepay")} disabled={submitted || saving} onToggle={() => toggle("prepay")} />
          </div>

          <div className="relative rounded-xl border border-border bg-card/60 p-3">
            <p className="text-sm text-muted-foreground">
              {locale === "ro" ? "Contacte: scrieți-ne în mesager!" : "Контакты: пишите нам в мессенджер!"}
            </p>
            <Hotspot zone={`${zoneWord} 5`} found={selected.has("contacts")} revealed={submitted && !selected.has("contacts")} disabled={submitted || saving} onToggle={() => toggle("contacts")} />
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
