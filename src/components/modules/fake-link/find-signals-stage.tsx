"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Gift,
  Globe,
  Landmark,
  Lock,
  RotateCw,
  Search,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import type { fakeLinkContent, FakeLinkLocale } from "@/data/fake-link";
import { useSignalSelection } from "@/features/modules/runner/use-signal-selection";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { playSound } from "@/features/sound/play-sound";
import { SignalHotspot as Hotspot } from "../shared/signal-hotspot";
import { SignalReview, SignalTrapFeedback, signalLabels } from "../shared/signal-review";

type FindSignalsContent =
  | (typeof fakeLinkContent)["ru"]["findSignals"]
  | (typeof fakeLinkContent)["ro"]["findSignals"];

const siteCopy = {
  ru: {
    tabTitle: "Banca Noroc — Онлайн-банк",
    notSecure: "Не защищено",
    navCards: "Карты",
    navCredits: "Кредиты",
    navHelp: "Помощь",
    urgentText: "Твой аккаунт будет заблокирован! Войди в течение 10 минут!",
    loginTitle: "Вход в интернет-банк",
    loginSub: "Введите данные для доступа к счёту",
    userLabel: "Логин",
    passLabel: "Пароль",
    pinLabel: "PIN карты + код CVV (3 цифры на обороте карты) (обязательно)",
    prizeBadge: "ПОЗДРАВЛЯЕМ!",
    prizeTitle: "Ты выиграл телефон! Забрать приз",
    prizeCta: "Получить сейчас",
    supportNote: "Поддержка 24/7 · Кишинёв",
    cluesLabel: "Улики",
    trapsLabel: "Ошибки",
  },
  ro: {
    tabTitle: "Banca Noroc — Online Banking",
    notSecure: "Nesigur",
    navCards: "Carduri",
    navCredits: "Credite",
    navHelp: "Ajutor",
    urgentText: "Contul tău va fi blocat! Conectează-te în 10 minute!",
    loginTitle: "Conectare la internet banking",
    loginSub: "Introdu datele pentru a accesa contul",
    userLabel: "Utilizator",
    passLabel: "Parolă",
    pinLabel: "PIN card + codul CVV (3 cifre de pe spatele cardului) (obligatoriu)",
    prizeBadge: "FELICITĂRI!",
    prizeTitle: "Ai câștigat un telefon! Ridică premiul",
    prizeCta: "Revendică acum",
    supportNote: "Suport 24/7 · Chișinău",
    cluesLabel: "Indicii",
    trapsLabel: "Capcane",
  },
} as const;

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
  const reducedMotion = useReducedMotion();
  const { selected, trapIds, lastTrap, submitted, passed, result, toggle, submit, retry } = useSignalSelection(
    content.signals.map((signal) => signal.id),
    content.normalDetails.map((detail) => detail.id),
    saving,
    onComplete,
  );
  const [countdown, setCountdown] = useState(599);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (submitted) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 599));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [submitted]);

  const zoneWord = locale === "ro" ? "Zona" : "Зона";
  const labels = signalLabels[locale];
  const t = siteCopy[locale];
  const totalSignals = content.signals.length;
  const minutes = String(Math.floor(countdown / 60)).padStart(2, "0");
  const seconds = String(countdown % 60).padStart(2, "0");

  function handleSignalToggle(id: string) {
    if (!selected.has(id) && !submitted && !saving) {
      playSound("correct");
    }
    toggle(id);
  }

  function handleTrapToggle(id: string) {
    if (!submitted && !saving) {
      setShakeKey((k) => k + 1);
    }
    toggle(id);
  }

  return (
    <div>
      <div className="rounded-3xl border-2 border-neon/35 bg-[linear-gradient(135deg,rgba(0,217,255,0.1),rgba(10,22,48,0.88))] p-4 sm:p-5">
        <p className="text-base font-bold leading-relaxed text-foreground sm:text-lg">{content.lead}</p>
        <p className="mt-1.5 text-sm font-semibold text-neon">{content.passNote}</p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/45 bg-neon/15 px-3 py-1 text-sm font-black text-neon">
              <Search className="size-4" aria-hidden="true" />
              {t.cluesLabel}: {selected.size}/{totalSignals}
            </span>
            <div className="flex items-center gap-1" aria-hidden="true">
              {content.signals.map((sig, idx) => {
                const lit = idx < selected.size;
                return (
                  <motion.span
                    key={sig.id}
                    animate={reducedMotion ? undefined : lit ? { scale: [0.7, 1.25, 1] } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 360, damping: 18 }}
                    className={`grid size-7 place-items-center rounded-full border ${
                      lit
                        ? "border-gold bg-gold/20 text-gold shadow-[0_0_12px_rgba(255,209,102,0.35)]"
                        : "border-border bg-card/60 text-muted-foreground/45"
                    }`}
                  >
                    <Star className={`size-3.5 ${lit ? "fill-current" : ""}`} />
                  </motion.span>
                );
              })}
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${
              result.trapClicks > 0
                ? "border-danger/60 bg-danger/15 text-danger"
                : "border-border bg-card/60 text-muted-foreground"
            }`}
          >
            <ShieldAlert className="size-4" aria-hidden="true" />
            {t.trapsLabel}: {result.trapClicks}/2
          </span>
        </div>
      </div>

      <SignalTrapFeedback locale={locale} detail={content.normalDetails.find((detail) => detail.id === lastTrap)} count={result.trapClicks} />

      <motion.div
        key={shakeKey > 0 ? `browser-shake-${shakeKey}` : "browser-steady"}
        animate={!reducedMotion && shakeKey > 0 ? { x: [0, -10, 10, -7, 7, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6 overflow-hidden rounded-3xl border-2 border-slate-500/70 bg-slate-900 shadow-[0_24px_65px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center gap-3 border-b border-slate-700/80 bg-slate-900 px-3 pt-2.5">
          <span className="flex gap-1.5 pb-2" aria-hidden="true">
            <span className="size-3 rounded-full bg-rose-500" />
            <span className="size-3 rounded-full bg-amber-400" />
            <span className="size-3 rounded-full bg-emerald-500" />
          </span>
          <div className="flex max-w-xs items-center gap-2 rounded-t-xl border-x border-t border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-bold text-slate-100">
            <Landmark className="size-4 shrink-0 text-amber-300" aria-hidden="true" />
            <span className="truncate">{t.tabTitle}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-700 bg-slate-800 px-3 py-2.5">
          <div className="hidden items-center gap-1.5 text-slate-400 sm:flex" aria-hidden="true">
            <span className="grid size-8 place-items-center rounded-lg bg-slate-900/60"><ArrowLeft className="size-4" /></span>
            <span className="grid size-8 place-items-center rounded-lg bg-slate-900/60"><ArrowRight className="size-4" /></span>
            <span className="grid size-8 place-items-center rounded-lg bg-slate-900/60"><RotateCw className="size-4" /></span>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-950/90 px-2 py-1 font-mono text-sm">
            <span className="relative inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-rose-500/15 px-2.5 text-sm font-bold text-rose-300">
              <span className="relative block" aria-hidden="true">
                <Lock className="size-4 text-rose-400" />
                <span className="absolute left-0 top-1/2 h-0.5 w-full -rotate-45 bg-rose-400" />
              </span>
              <span>{t.notSecure}</span>
              <Hotspot zone={`${zoneWord} 2`} found={selected.has("no-https")} disabled={submitted || saving} onToggle={() => handleSignalToggle("no-https")} />
            </span>

            <span className="relative inline-flex min-h-11 min-w-0 flex-1 items-center break-all rounded-lg px-2 py-1 text-sm text-slate-200">
              <span>
                <span className="text-rose-400">http://</span>
                <strong className="font-bold text-white">banca-noroc-online.com</strong>
                <span className="text-slate-400">/login</span>
              </span>
              <Hotspot zone={`${zoneWord} 1`} found={selected.has("domain")} disabled={submitted || saving} onToggle={() => handleSignalToggle("domain")} />
            </span>
          </div>
        </div>

        <div className="bg-slate-100 text-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d2547] px-4 py-3 text-white sm:px-6">
            <span className="relative inline-flex min-h-11 min-w-11 items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2">
              <span className="flex items-center gap-2 blur-[1.7px]" aria-hidden="true">
                <span className="grid size-8 place-items-center rounded-lg bg-amber-400 text-[#0d2547]">
                  <Landmark className="size-5" />
                </span>
                <span className="text-lg font-black tracking-wide text-white">Banca Noroc</span>
              </span>
              <Hotspot zone={`${zoneWord} 4`} found={selected.has("logo")} disabled={submitted || saving} onToggle={() => handleSignalToggle("logo")} />
            </span>

            <div className="hidden items-center gap-4 text-sm font-semibold text-slate-200/80 md:flex" aria-hidden="true">
              <span>{t.navCards}</span>
              <span>{t.navCredits}</span>
              <span>{t.navHelp}</span>
            </div>

            <span className="relative inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
              <Globe className="size-4 text-sky-300" aria-hidden="true" />
              <span>{content.normalDetails[1].title}</span>
              <Hotspot zone={content.normalDetails[1].title} found={false} disabled={submitted || saving} onToggle={() => handleTrapToggle(content.normalDetails[1].id)} />
            </span>
          </div>

          <div className="relative bg-red-600 px-4 py-3 text-center text-white shadow-inner">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <AlertTriangle className="size-5 shrink-0 animate-bounce text-amber-200" aria-hidden="true" />
              <p className="text-sm font-black sm:text-base">{t.urgentText}</p>
              <span className="rounded-lg bg-black/30 px-2.5 py-0.5 font-mono text-sm font-black tabular-nums text-amber-200" aria-hidden="true">
                {minutes}:{seconds}
              </span>
            </div>
            <Hotspot zone={`${zoneWord} 3`} found={selected.has("urgency")} disabled={submitted || saving} onToggle={() => handleSignalToggle("urgency")} />
          </div>

          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#0d2547]/10 text-[#0d2547]">
                  <UserRound className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">{t.loginTitle}</h3>
                  <p className="text-sm text-slate-500">{t.loginSub}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                  <span className="block text-sm font-semibold text-slate-500">{t.userLabel}</span>
                  <span className="mt-0.5 block text-sm font-bold text-slate-800">alex.popescu</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                  <span className="block text-sm font-semibold text-slate-500">{t.passLabel}</span>
                  <span className="mt-0.5 block text-sm font-bold tracking-widest text-slate-800">••••••••</span>
                </div>

                <div className="relative min-h-14 rounded-xl border-2 border-red-300 bg-red-50/80 px-3.5 py-2.5 sm:col-span-2">
                  <span className="flex items-start gap-2 text-sm font-bold text-red-900">
                    <CreditCard className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
                    <span>{t.pinLabel}</span>
                  </span>
                  <span className="mt-1 block font-mono text-sm text-red-400" aria-hidden="true">PIN: •••• &nbsp;|&nbsp; CVV: •••</span>
                  <Hotspot zone={`${zoneWord} 5`} found={selected.has("form")} disabled={submitted || saving} onToggle={() => handleSignalToggle("form")} />
                </div>
              </div>

              <span className="relative mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#0d2547] px-4 py-2.5 text-base font-black text-white shadow-sm">
                {content.normalDetails[0].title}
                <Hotspot zone={content.normalDetails[0].title} found={false} disabled={submitted || saving} onToggle={() => handleTrapToggle(content.normalDetails[0].id)} />
              </span>
            </div>

            <motion.div
              animate={reducedMotion || selected.has("prize") ? { y: 0 } : { y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-300 via-yellow-200 to-orange-300 p-5 text-center text-slate-950 shadow-lg"
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-sm font-black uppercase text-white shadow">
                <Sparkles className="size-4" aria-hidden="true" />
                {t.prizeBadge}
              </div>
              <div className="mx-auto mt-3 flex size-16 items-center justify-center gap-1 rounded-2xl bg-white/80 text-orange-600 shadow-inner" aria-hidden="true">
                <Gift className="size-7" />
                <Smartphone className="size-7 text-slate-900" />
              </div>
              <p className="mt-3 text-base font-black leading-snug text-slate-950">{t.prizeTitle}</p>
              <span className="mt-3 inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow" aria-hidden="true">
                {t.prizeCta}
              </span>
              <Hotspot zone={`${zoneWord} 6`} found={selected.has("prize")} disabled={submitted || saving} onToggle={() => handleSignalToggle("prize")} />
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-200/75 px-4 py-3 text-sm text-slate-600 sm:px-6">
            <span className="relative inline-flex min-h-11 min-w-11 items-center rounded-lg px-2.5 py-1.5 font-semibold text-slate-700">
              {content.normalDetails[2].title}
              <Hotspot zone={content.normalDetails[2].title} found={false} disabled={submitted || saving} onToggle={() => handleTrapToggle(content.normalDetails[2].id)} />
            </span>
            <span className="font-medium text-slate-500" aria-hidden="true">{t.supportNote}</span>
          </div>
        </div>
      </motion.div>

      <div aria-live="polite" className="mt-6">
        {submitted ? (
          <SignalReview
            locale={locale}
            content={content}
            selected={selected}
            trapIds={trapIds}
            passed={passed}
            found={result.correct}
            trapClicks={result.trapClicks}
            retryLabel={retryLabel}
            saving={saving}
            onRetry={retry}
          />
        ) : (
          <motion.button
            type="button"
            onClick={submit}
            disabled={saving || (selected.size === 0 && result.trapClicks === 0)}
            whileHover={reducedMotion ? undefined : { scale: 1.02, y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className="focus-ring inline-flex min-h-12 min-w-11 items-center gap-2 rounded-2xl bg-neon px-6 text-base font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition disabled:opacity-60"
          >
            <Search className="size-5" aria-hidden="true" />
            {checkLabel} · {labels.selected}: {selected.size}/{totalSignals}
          </motion.button>
        )}
      </div>
    </div>
  );
}
