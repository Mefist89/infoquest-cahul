"use client";

import { Timer } from "lucide-react";

import type { scamOrRealContent, ScamOrRealLocale } from "@/data/scam-or-real";
import { useSignalSelection } from "@/features/modules/runner/use-signal-selection";
import { SignalHotspot as Hotspot } from "../shared/signal-hotspot";
import { SignalReview, SignalTrapFeedback, signalLabels } from "../shared/signal-review";
import type { StageResult } from "@/features/modules/runner/use-module-runner";

type DealSignalsContent =
  | (typeof scamOrRealContent)["ru"]["dealSignals"]
  | (typeof scamOrRealContent)["ro"]["dealSignals"];

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
  const { selected, trapIds, lastTrap, submitted, passed, result, toggle, submit, retry } = useSignalSelection(
    content.signals.map(signal => signal.id), content.normalDetails.map(detail => detail.id), saving, onComplete,
  );
  const zoneWord = locale === "ro" ? "Zona" : "Зона";
  const labels = signalLabels[locale];

  return (
    <div>
      <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">{content.lead}</p>
      <p className="mt-2 text-sm font-semibold text-neon">{content.passNote}</p>
      <SignalTrapFeedback locale={locale} detail={content.normalDetails.find(detail => detail.id === lastTrap)} count={result.trapClicks} />

      {/* Объявление мошенников: мокап карточки товара на чистом CSS, без картинок. */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background/60">
        <div className="border-b border-border bg-card/70 px-4 py-2">
          <p className="truncate text-sm font-bold text-foreground sm:text-base">
            {locale === "ro" ? "Telefon Ultra X — NOU! Reducere −50%" : "Телефон Ультра X — НОВЫЙ! Скидка −50%"}
          </p>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <span className="relative inline-flex min-h-11 min-w-11 items-center rounded-lg border border-border px-3 py-2 text-base text-foreground">
                {content.normalDetails[2].title}
                <Hotspot zone={content.normalDetails[2].title} found={false} disabled={submitted || saving} onToggle={() => toggle(content.normalDetails[2].id)} />
              </span>
          <div className="min-h-11 min-w-11 relative rounded-xl border border-danger/50 bg-danger/10 p-3 text-center">
            <p className="flex items-center justify-center gap-2 text-sm font-black text-danger sm:text-base">
              <Timer className="size-4" aria-hidden="true" />
              {locale === "ro" ? "Oferta expiră în 04:59! Au rămas 2 bucăți!" : "Скидка сгорит через 04:59! Осталось 2 штуки!"}
            </p>
            <Hotspot zone={`${zoneWord} 4`} found={selected.has("urgency")} disabled={submitted || saving} onToggle={() => toggle("urgency")} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-11 relative grid min-h-40 place-items-center overflow-hidden rounded-xl border border-border bg-secondary/40">
              <span aria-hidden="true" className="px-4 text-center text-4xl font-black tracking-widest text-muted-foreground blur-[3px]">ULTRA X</span>
              <Hotspot zone={`${zoneWord} 6`} found={selected.has("photo")} disabled={submitted || saving} onToggle={() => toggle("photo")} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="min-h-11 min-w-11 relative rounded-xl border border-gold/50 bg-gold/10 p-3 text-center">
                <p className="text-xs text-muted-foreground line-through">12000 {locale === "ro" ? "lei" : "леев"}</p>
                <p className="text-2xl font-black text-gold">5999 {locale === "ro" ? "lei" : "леев"}</p>
                <Hotspot zone={`${zoneWord} 1`} found={selected.has("price")} disabled={submitted || saving} onToggle={() => toggle("price")} />
              </div>
              <div className="min-h-11 min-w-11 relative rounded-xl border border-border bg-card/60 p-3">
                <p className="text-sm font-bold text-foreground">MagazinSuper_2026</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {locale === "ro" ? "Pe site de 6 zile · 0 recenzii" : "На сайте 6 дней · 0 отзывов"}
                </p>
                <Hotspot zone={`${zoneWord} 3`} found={selected.has("seller")} disabled={submitted || saving} onToggle={() => toggle("seller")} />
              </div>
            </div>
          </div>

          <span className="relative inline-flex min-h-11 min-w-11 items-center rounded-lg border border-border px-3 py-2 text-base text-foreground">
                {content.normalDetails[0].title}
                <Hotspot zone={content.normalDetails[0].title} found={false} disabled={submitted || saving} onToggle={() => toggle(content.normalDetails[0].id)} />
              </span>

          <div className="min-h-11 min-w-11 relative rounded-xl border border-danger/50 bg-danger/5 p-3">
            <p className="text-sm font-bold text-foreground">
              {locale === "ro" ? "Plată 100% în avans pe cardul vânzătorului" : "Оплата 100% вперёд на карту продавца"}
            </p>
            <Hotspot zone={`${zoneWord} 2`} found={selected.has("prepay")} disabled={submitted || saving} onToggle={() => toggle("prepay")} />
          </div>

          <div className="min-h-11 min-w-11 relative rounded-xl border border-border bg-card/60 p-3">
            <p className="text-sm text-muted-foreground">
              {locale === "ro" ? "Contacte: scrieți-ne în mesager!" : "Контакты: пишите нам в мессенджер!"}
            </p>
            <Hotspot zone={`${zoneWord} 5`} found={selected.has("contacts")} disabled={submitted || saving} onToggle={() => toggle("contacts")} />
          </div>
          <span className="relative inline-flex min-h-11 min-w-11 items-center rounded-lg border border-border px-3 py-2 text-base text-foreground">
                {content.normalDetails[1].title}
                <Hotspot zone={content.normalDetails[1].title} found={false} disabled={submitted || saving} onToggle={() => toggle(content.normalDetails[1].id)} />
              </span>
        </div>
      </div>

      <div aria-live="polite" className="mt-6">
        {submitted ? (
          <SignalReview locale={locale} content={content} selected={selected} trapIds={trapIds} passed={passed} found={result.correct} trapClicks={result.trapClicks} retryLabel={retryLabel} saving={saving} onRetry={retry} />
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={saving || (selected.size === 0 && result.trapClicks === 0)}
            className="min-w-11 focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-base font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {checkLabel} · {labels.selected}: {selected.size}
          </button>
        )}
      </div>
    </div>
  );
}
