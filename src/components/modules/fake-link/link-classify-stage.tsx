"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  Landmark,
  Lock,
  MessageSquare,
  Package,
  RotateCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import type { fakeLinkContent } from "@/data/fake-link";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { useRetryQuiz } from "@/features/modules/runner/use-retry-quiz";
import { retryLabels } from "../shared/retry-labels";

type LinkClassifyContent =
  | (typeof fakeLinkContent)["ru"]["linkClassify"]
  | (typeof fakeLinkContent)["ro"]["linkClassify"];

const PASS_COUNT = 5;

const SPARKS = [
  { x: -64, y: -42, color: "text-gold" },
  { x: -32, y: -64, color: "text-neon" },
  { x: 0, y: -70, color: "text-success" },
  { x: 34, y: -62, color: "text-gold" },
  { x: 66, y: -40, color: "text-pink-400" },
  { x: -68, y: 12, color: "text-success" },
  { x: 68, y: 14, color: "text-neon" },
] as const;

const uiCopy = {
  ru: {
    howOpened: "Как открыта ссылка:",
    bankTitle: "Banca Noroc — Вход",
    bankHeading: "Интернет-банк",
    bankUser: "Логин",
    bankPass: "Пароль",
    bankBtn: "Войти",
    postaTitle: "Почта · Отслеживание посылок",
    postaHeading: "Статус посылки #MD-4829",
    postaSub: "Проверка доставки и уведомлений",
    postaBtn: "Проверить посылку",
    searchTitle: "Поиск в интернете",
    searchPlaceholder: "Введите запрос или проверьте аккаунт...",
    searchBtn: "Поиск",
    accountSub: "Проверка безопасности аккаунта",
    starsLabel: "Верно",
  },
  ro: {
    howOpened: "Cum ai ajuns pe link:",
    bankTitle: "Banca Noroc — Conectare",
    bankHeading: "Internet Banking",
    bankUser: "Utilizator",
    bankPass: "Parolă",
    bankBtn: "Autentificare",
    postaTitle: "Poșta · Urmărire colete",
    postaHeading: "Statut colet #MD-4829",
    postaSub: "Verificare livrare și notificări",
    postaBtn: "Verifică coletul",
    searchTitle: "Căutare pe internet",
    searchPlaceholder: "Caută sau verifică contul...",
    searchBtn: "Căutare",
    accountSub: "Verificare securitate cont",
    starsLabel: "Corect",
  },
} as const;

function parseUrlParts(rawUrl: string) {
  const isHttps = rawUrl.startsWith("https://");
  const protocol = isHttps ? "https://" : "http://";
  const withoutProto = rawUrl.replace(/^https?:\/\//u, "");
  const slashIndex = withoutProto.indexOf("/");
  const host = slashIndex === -1 ? withoutProto : withoutProto.slice(0, slashIndex);
  const path = slashIndex === -1 ? "" : withoutProto.slice(slashIndex);
  return { isHttps, protocol, host, path };
}

function getTabMeta(id: string, locale: "ru" | "ro") {
  const t = uiCopy[locale];
  if (id.startsWith("bank")) return { title: t.bankTitle, kind: "bank" as const };
  if (id.startsWith("posta")) return { title: t.postaTitle, kind: "posta" as const };
  return { title: t.searchTitle, kind: "search" as const };
}

function MiniSiteBody({ id, locale }: { id: string; locale: "ru" | "ro" }) {
  const t = uiCopy[locale];
  const { kind } = getTabMeta(id, locale);

  if (kind === "bank") {
    return (
      <div className="bg-slate-100 text-slate-900">
        <div className="flex items-center justify-between bg-[#0d2547] px-4 py-2.5 text-white">
          <span className="flex items-center gap-2 font-black">
            <span className="grid size-7 place-items-center rounded-lg bg-amber-400 text-[#0d2547]">
              <Landmark className="size-4" aria-hidden="true" />
            </span>
            <span>Banca Noroc</span>
          </span>
          <span className="text-sm font-semibold text-sky-200">{t.bankHeading}</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{t.bankUser}</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm tracking-widest text-slate-500">••••••</div>
            </div>
            <div className="mt-3 rounded-lg bg-[#0d2547] py-2 text-center text-sm font-black text-white">{t.bankBtn}</div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "posta") {
    return (
      <div className="bg-amber-50/70 text-slate-900">
        <div className="flex items-center justify-between bg-[#1b4f9c] px-4 py-2.5 text-white">
          <span className="flex items-center gap-2 font-black">
            <span className="grid size-7 place-items-center rounded-lg bg-amber-300 text-[#1b4f9c]">
              <Package className="size-4" aria-hidden="true" />
            </span>
            <span>Poșta</span>
          </span>
          <span className="text-sm font-semibold text-amber-200">MD</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="mx-auto flex max-w-md flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-base font-black text-slate-900">{t.postaHeading}</p>
              <p className="mt-0.5 text-sm text-slate-600">{t.postaSub}</p>
            </div>
            <span className="rounded-xl bg-[#1b4f9c] px-3.5 py-2 text-sm font-black text-white">{t.postaBtn}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white px-4 py-6 text-center text-slate-900 sm:px-6">
      <p className="font-display text-3xl font-black tracking-tight" aria-hidden="true">
        <span className="text-blue-600">G</span>
        <span className="text-red-500">o</span>
        <span className="text-amber-500">o</span>
        <span className="text-blue-600">g</span>
        <span className="text-emerald-600">l</span>
        <span className="text-red-500">e</span>
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        {id === "search-fake" ? t.accountSub : t.searchTitle}
      </p>
      <div className="mx-auto mt-3 flex max-w-md items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-left text-sm text-slate-500 shadow-inner">
        <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="truncate">{t.searchPlaceholder}</span>
      </div>
    </div>
  );
}

export function LinkClassifyStage({
  locale,
  content,
  retryLabel,
  saving,
  onComplete,
}: {
  locale: "ru" | "ro";
  content: LinkClassifyContent;
  retryLabel: string;
  saving: boolean;
  onComplete: (result: StageResult) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [answers, setAnswers] = useState<Record<string, "safe" | "phishing">>({});
  const [shakeKey, setShakeKey] = useState(0);
  const quiz = useRetryQuiz(content.items.map((entry) => entry.id), PASS_COUNT, onComplete, saving);
  const { index, revealed, finished, passed, correctCount, advance, retry } = quiz;
  const t = uiCopy[locale];

  const item = content.items[index];
  const answer = item ? answers[item.id] : undefined;
  const isCorrect = item && answer === item.verdict;

  function choose(verdict: "safe" | "phishing") {
    if (!item || revealed || saving) return;
    const hit = verdict === item.verdict;
    if (quiz.answer(hit, item.explain)) {
      setAnswers((previous) => ({ ...previous, [item.id]: verdict }));
      if (!hit) setShakeKey((k) => k + 1);
    }
  }

  const counter = (quiz.retrying ? retryLabels[locale].repeat : retryLabels[locale].question)
    .replace("{current}", String(quiz.roundPosition))
    .replace("{total}", String(quiz.roundTotal));

  const urlParts = item ? parseUrlParts(item.url) : null;
  const tabMeta = item ? getTabMeta(item.id, locale) : null;
  const browserTone = !revealed
    ? "border-slate-500/70 shadow-[0_22px_55px_rgba(0,0,0,0.5)]"
    : isCorrect
      ? "border-success/80 shadow-[0_22px_55px_rgba(34,197,94,0.25)]"
      : "border-danger/80 shadow-[0_22px_55px_rgba(244,63,94,0.28)]";

  return (
    <div>
      <div className="rounded-3xl border-2 border-neon/35 bg-[linear-gradient(135deg,rgba(0,217,255,0.1),rgba(10,22,48,0.88))] p-4 sm:p-5">
        <p className="text-base font-bold leading-relaxed text-foreground sm:text-lg">{content.prompt}</p>
        <p className="mt-1.5 text-sm font-semibold text-neon">{content.passNote}</p>
        {quiz.retrying && !finished && (
          <p role="status" className="mt-2.5 text-sm font-bold text-success">
            {retryLabels[locale].questionsKept}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/45 bg-neon/15 px-3 py-1 font-display text-sm font-black uppercase tracking-wider text-neon">
            <Globe className="size-4" aria-hidden="true" />
            {counter}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-gold/15 px-3 py-1 text-sm font-black text-gold">
              <Star className="size-4 fill-current" aria-hidden="true" />
              {t.starsLabel}: {correctCount}/{content.items.length}
            </span>
          </div>
        </div>
      </div>

      <div aria-live="polite" className="mt-6">
        {!finished && item && urlParts && tabMeta ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${item.id}-${shakeKey}`}
              initial={reducedMotion ? { opacity: 1 } : shakeKey > 0 && revealed ? { x: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
              animate={
                !reducedMotion && revealed && !isCorrect
                  ? { x: [0, -12, 12, -8, 8, -4, 4, 0], opacity: 1, y: 0, scale: 1 }
                  : { x: 0, opacity: 1, y: 0, scale: 1 }
              }
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: revealed && !isCorrect ? 0.45 : 0.28 }}
            >
              <div className="mb-3 flex items-center gap-2.5 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-foreground">
                <MessageSquare className="size-4 shrink-0 text-gold" aria-hidden="true" />
                <span>
                  <strong className="text-gold">{t.howOpened}</strong> {item.context}
                </span>
              </div>

              <div className={`overflow-hidden rounded-3xl border-2 bg-slate-900 transition-colors duration-300 ${browserTone}`}>
                <div className="flex items-center gap-3 border-b border-slate-700/80 bg-slate-900 px-3 pt-2.5">
                  <span className="flex gap-1.5 pb-2" aria-hidden="true">
                    <span className="size-3 rounded-full bg-rose-500" />
                    <span className="size-3 rounded-full bg-amber-400" />
                    <span className="size-3 rounded-full bg-emerald-500" />
                  </span>
                  <div className="flex max-w-xs items-center gap-2 rounded-t-xl border-x border-t border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-bold text-slate-100">
                    <Globe className="size-4 shrink-0 text-neon" aria-hidden="true" />
                    <span className="truncate">{tabMeta.title}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-b border-slate-700 bg-slate-800 px-3 py-2.5">
                  <div className="hidden items-center gap-1.5 text-slate-400 sm:flex" aria-hidden="true">
                    <span className="grid size-8 place-items-center rounded-lg bg-slate-900/60"><ArrowLeft className="size-4" /></span>
                    <span className="grid size-8 place-items-center rounded-lg bg-slate-900/60"><ArrowRight className="size-4" /></span>
                    <span className="grid size-8 place-items-center rounded-lg bg-slate-900/60"><RotateCw className="size-4" /></span>
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-600 bg-slate-950/95 px-3 py-2 font-mono text-sm sm:text-base">
                    {urlParts.isHttps ? (
                      <Lock className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <span className="relative inline-block shrink-0" aria-hidden="true">
                        <Lock className="size-4 text-rose-400" />
                        <span className="absolute left-0 top-1/2 h-0.5 w-full -rotate-45 bg-rose-400" />
                      </span>
                    )}
                    <p className="min-w-0 break-all font-bold text-white">
                      <span className={urlParts.isHttps ? "text-emerald-300" : "text-rose-400"}>{urlParts.protocol}</span>
                      <span className="text-white">{urlParts.host}</span>
                      <span className="text-slate-400">{urlParts.path}</span>
                    </p>
                  </div>
                </div>

                <MiniSiteBody id={item.id} locale={locale} />
              </div>

              {!revealed ? (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
                  <motion.button
                    type="button"
                    onClick={() => choose("safe")}
                    whileHover={reducedMotion ? undefined : { scale: 1.02, y: -1 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                    className="focus-ring flex min-h-16 min-w-11 items-center justify-center gap-2 rounded-2xl border-2 border-success/60 bg-success/15 px-3 text-center text-base font-black text-success shadow-[0_8px_22px_rgba(34,197,94,0.16)] transition hover:border-success hover:bg-success/25"
                  >
                    <ShieldCheck className="size-6 shrink-0" aria-hidden="true" />
                    <span>{content.safe}</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => choose("phishing")}
                    whileHover={reducedMotion ? undefined : { scale: 1.02, y: -1 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                    className="focus-ring flex min-h-16 min-w-11 items-center justify-center gap-2 rounded-2xl border-2 border-danger/65 bg-danger/15 px-3 text-center text-base font-black text-danger shadow-[0_8px_22px_rgba(244,63,94,0.18)] transition hover:border-danger hover:bg-danger/25"
                  >
                    <ShieldAlert className="size-6 shrink-0" aria-hidden="true" />
                    <span>{content.danger}</span>
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={`relative mt-5 overflow-hidden rounded-3xl border-2 p-5 ${
                    isCorrect
                      ? "border-success/75 bg-success/10 shadow-[0_0_30px_rgba(34,197,94,0.18)]"
                      : "border-danger/75 bg-danger/10 shadow-[0_0_30px_rgba(244,63,94,0.18)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative grid size-12 shrink-0 place-items-center">
                      {!reducedMotion && isCorrect && (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                          {SPARKS.map((spark, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                              animate={{ x: spark.x, y: spark.y, scale: [0, 1.15, 0.7], opacity: [1, 1, 0] }}
                              transition={{ duration: 0.7, ease: "easeOut" }}
                              className={`absolute ${spark.color}`}
                            >
                              {idx % 2 === 0 ? <Star className="size-3.5 fill-current" /> : <Sparkles className="size-3.5" />}
                            </motion.span>
                          ))}
                        </span>
                      )}
                      <span
                        className={`grid size-12 place-items-center rounded-2xl border-2 ${
                          isCorrect
                            ? "border-success bg-success/20 text-success"
                            : "border-danger bg-danger/20 text-danger"
                        }`}
                      >
                        {isCorrect ? <CheckCircle2 className="size-6" aria-hidden="true" /> : <AlertTriangle className="size-6" aria-hidden="true" />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-display text-xl font-black ${isCorrect ? "text-success" : "text-danger"}`}>
                        {isCorrect ? content.correctMark : content.wrongMark}
                      </p>
                      <p className="mt-1 text-base leading-relaxed text-foreground">{item.explain}</p>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    onClick={advance}
                    disabled={saving}
                    whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                    className="focus-ring mt-4 inline-flex min-h-12 min-w-11 items-center gap-2 rounded-2xl bg-neon px-6 text-base font-black text-primary-foreground shadow-[0_0_20px_rgba(0,217,255,0.28)] disabled:opacity-60"
                  >
                    {content.next}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={reducedMotion ? false : { scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className={`rounded-3xl border-2 p-6 ${
              passed
                ? "border-success/65 bg-success/10 shadow-[0_0_34px_rgba(34,197,94,0.18)]"
                : "border-danger/60 bg-danger/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-2xl border-2 ${
                  passed ? "border-gold bg-gold/20 text-gold" : "border-danger bg-danger/20 text-danger"
                }`}
              >
                {passed ? <Trophy className="size-7" aria-hidden="true" /> : <AlertTriangle className="size-7" aria-hidden="true" />}
              </span>
              <div>
                <p className={`font-display text-xl font-black ${passed ? "text-success" : "text-danger"}`}>
                  {passed ? content.successTitle : content.failTitle}
                </p>
                <p className="mt-0.5 text-base font-bold text-foreground">
                  {content.resultCount.replace("{score}", String(correctCount))}
                </p>
              </div>
            </div>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {content.items.map((entry) => {
                const hit = answers[entry.id] === entry.verdict;
                return (
                  <li
                    key={entry.id}
                    className={`rounded-2xl border p-3.5 text-sm ${
                      hit ? "border-success/45 bg-success/5" : "border-border bg-background/50"
                    }`}
                  >
                    <p className="break-all font-mono font-bold text-foreground">{entry.url}</p>
                    <p className={`mt-1.5 font-bold ${hit ? "text-success" : "text-danger"}`}>
                      {hit ? (
                        <Check className="mr-1.5 inline size-4" aria-hidden="true" />
                      ) : (
                        <X className="mr-1.5 inline size-4" aria-hidden="true" />
                      )}
                      {hit ? content.correctMark : content.wrongMark}{" "}
                      {entry.verdict === "safe" ? content.safe : content.danger}
                    </p>
                    {!hit && <p className="mt-1 text-muted-foreground">{entry.explain}</p>}
                  </li>
                );
              })}
            </ul>

            {!passed && (
              <button
                type="button"
                onClick={retry}
                className="focus-ring mt-5 inline-flex min-h-12 min-w-11 items-center rounded-2xl bg-neon px-6 text-base font-black text-primary-foreground transition hover:-translate-y-0.5"
              >
                {retryLabel}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
