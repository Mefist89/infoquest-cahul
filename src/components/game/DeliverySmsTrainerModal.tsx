"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Info,
  MessageSquareWarning,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";

import type { PatrolLocale } from "@/data/patrol";
import {
  DELIVERY_SMS_CASES,
  DELIVERY_SMS_THEORY,
  DELIVERY_SMS_UI,
  type SmsSegment,
} from "@/data/patrol-delivery-sms";

type TrainerStep = "theory" | "practice" | "summary";

export function DeliverySmsTrainerModal({
  locale,
  onClose,
  onComplete,
}: {
  locale: PatrolLocale;
  onClose: () => void;
  onComplete: (correct: boolean) => void;
}) {
  const ui = DELIVERY_SMS_UI[locale];
  const [step, setStep] = useState<TrainerStep>("theory");
  const [caseIndex, setCaseIndex] = useState(0);
  const [foundFlagIds, setFoundFlagIds] = useState<string[]>([]);
  const [activeSegment, setActiveSegment] = useState<SmsSegment | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const currentCase = DELIVERY_SMS_CASES[caseIndex] ?? DELIVERY_SMS_CASES[0];
  const totalFlagsInCase = currentCase.segments.filter((segment) => segment.isFlag).length;
  const allFlagsFound = foundFlagIds.length >= totalFlagsInCase;
  const selectedOption = currentCase.options.find((opt) => opt.id === selectedOptionId) ?? null;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleSegmentClick(segment: SmsSegment) {
    setActiveSegment(segment);
    if (segment.isFlag && !foundFlagIds.includes(segment.id)) {
      setFoundFlagIds((prev) => [...prev, segment.id]);
    }
  }

  function handleNextCase() {
    if (caseIndex + 1 < DELIVERY_SMS_CASES.length) {
      setCaseIndex((prev) => prev + 1);
      setFoundFlagIds([]);
      setActiveSegment(null);
      setSelectedOptionId(null);
    } else {
      setStep("summary");
    }
  }

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-[#040916]/92 p-2 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={DELIVERY_SMS_THEORY.title[locale]}
    >
      <div className="flex h-full max-h-[580px] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl border-2 border-neon/70 bg-[#0a1528] text-foreground shadow-[0_0_50px_rgba(0,217,255,0.22)]">
        {/* Верхняя панель с шагами обучения */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neon/25 bg-[#060d1f] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg border border-neon/40 bg-neon/10 text-neon">
              <Smartphone className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-neon">
                {DELIVERY_SMS_THEORY.categoryBadge[locale]}
              </p>
              <p className="text-xs font-bold text-gold">
                {locale === "ro" ? "Maria · Oficiul Poștal" : "Мария · Район Почты"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span
              className={`rounded-full px-2.5 py-1 ${
                step === "theory"
                  ? "bg-neon text-slate-950"
                  : "border border-neon/30 bg-neon/10 text-neon"
              }`}
            >
              {ui.stepTheory}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${
                step === "practice"
                  ? "bg-neon text-slate-950"
                  : "border border-border bg-secondary/60 text-muted-foreground"
              }`}
            >
              {ui.stepPractice}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${
                step === "summary"
                  ? "bg-success text-slate-950"
                  : "border border-border bg-secondary/60 text-muted-foreground"
              }`}
            >
              {ui.stepSummary}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={ui.closeLabel}
            className="focus-ring inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card/80 text-muted-foreground transition hover:border-neon hover:text-neon"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Контент текущего шага */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {step === "theory" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-white sm:text-xl">
                  {DELIVERY_SMS_THEORY.title[locale]}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {DELIVERY_SMS_THEORY.subtitle[locale]}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {DELIVERY_SMS_THEORY.rules.map((rule) => (
                  <article
                    key={rule.id}
                    className="rounded-xl border border-neon/25 bg-[#112240]/80 p-3.5"
                  >
                    <h3 className="flex items-center gap-2 text-xs font-black text-neon sm:text-sm">
                      <BookOpen className="size-4 shrink-0" aria-hidden="true" />
                      {rule.title[locale]}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                      {rule.description[locale]}
                    </p>
                    <p className="mt-2 rounded-lg border border-danger/35 bg-danger/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-200">
                      {rule.example[locale]}
                    </p>
                  </article>
                ))}
              </div>

              <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 p-3.5 sm:flex-row sm:items-center">
                <p className="text-xs font-bold leading-relaxed text-amber-100">
                  {DELIVERY_SMS_THEORY.goldenRule[locale]}
                </p>
                <button
                  type="button"
                  onClick={() => setStep("practice")}
                  className="focus-ring inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-neon px-5 text-xs font-black text-slate-950 shadow-lg transition hover:brightness-110 sm:text-sm"
                >
                  {ui.startPracticeBtn}
                </button>
              </div>
            </div>
          )}

          {step === "practice" && (
            <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              {/* Левая колонка: экран смартфона с интерактивным текстом SMS */}
              <div className="flex flex-col justify-between rounded-2xl border border-neon/35 bg-[#060d1f] p-3.5">
                <div>
                  {/* Индикатор прогресса по цепочке из 3 SMS */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                    <span className="rounded-full border border-gold/45 bg-gold/15 px-3 py-0.5 text-xs font-black text-gold">
                      {currentCase.badge[locale]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {DELIVERY_SMS_CASES.map((item, idx) => (
                        <span
                          key={item.id}
                          className={`h-2 rounded-full transition-all ${
                            idx < caseIndex
                              ? "w-6 bg-success"
                              : idx === caseIndex
                                ? "w-8 bg-neon"
                                : "w-3 bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
                    {currentCase.context[locale]}
                  </p>

                  {/* Шапка входящего SMS на экране телефона */}
                  <div className="mt-3 rounded-2xl border border-slate-700 bg-[#0f1d36] p-3.5 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 text-xs">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                          {ui.incomingSmsLabel}
                        </span>
                        <span className="font-mono text-sm font-black text-white">
                          {currentCase.sender}
                        </span>
                      </div>
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-300">
                        {currentCase.time}
                      </span>
                    </div>

                    {/* Пузырь SMS из кликабельных текстовых сегментов */}
                    <div className="mt-3 space-y-2">
                      {currentCase.segments.map((segment) => {
                        const isFound = foundFlagIds.includes(segment.id);
                        const isSelected = activeSegment?.id === segment.id;

                        return (
                          <button
                            key={segment.id}
                            type="button"
                            onClick={() => handleSegmentClick(segment)}
                            aria-pressed={isFound}
                            className={`focus-ring block w-full rounded-xl border px-3 py-2 text-left text-xs leading-relaxed transition sm:text-sm ${
                              isFound
                                ? "border-danger bg-danger/20 font-bold text-amber-100 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                                : isSelected && !segment.isFlag
                                  ? "border-neon/60 bg-neon/10 text-slate-200"
                                  : "border-slate-700 bg-[#162847] text-slate-100 hover:border-neon/60 hover:bg-[#1c3258]"
                            }`}
                          >
                            <span className="flex items-start justify-between gap-2">
                              <span>{segment.text[locale]}</span>
                              {isFound && (
                                <span className="shrink-0 rounded-md bg-danger px-1.5 py-0.5 text-[10px] font-black uppercase text-white">
                                  {locale === "ro" ? "Semnal" : "Улика"}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Счётчик найденных красных флагов + пояснение по кликнутому фрагменту */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">{ui.flagsCounter}:</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-black ${
                        allFlagsFound
                          ? "bg-success/20 text-success"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {foundFlagIds.length} / {totalFlagsInCase}
                    </span>
                  </div>

                  {activeSegment ? (
                    <div
                      className={`rounded-xl border p-2.5 text-xs leading-relaxed ${
                        activeSegment.isFlag
                          ? "border-danger/50 bg-danger/15 text-amber-100"
                          : "border-neon/40 bg-neon/10 text-slate-200"
                      }`}
                      role="status"
                      aria-live="polite"
                    >
                      <p className="flex items-center gap-1.5 font-black">
                        {activeSegment.isFlag ? (
                          <AlertTriangle className="size-4 shrink-0 text-danger" aria-hidden="true" />
                        ) : (
                          <Info className="size-4 shrink-0 text-neon" aria-hidden="true" />
                        )}
                        {activeSegment.flagTitle
                          ? activeSegment.flagTitle[locale]
                          : locale === "ro"
                            ? "Observație"
                            : "Заметка детектива"}
                      </p>
                      <p className="mt-1">{activeSegment.explanation[locale]}</p>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-neon/35 bg-neon/5 px-3 py-2 text-xs text-neon">
                      {ui.clickHint}
                    </p>
                  )}
                </div>
              </div>

              {/* Правая колонка: список улик и выбор безопасного решения */}
              <div className="flex flex-col justify-between rounded-2xl border border-neon/25 bg-[#112240]/70 p-3.5">
                {!allFlagsFound ? (
                  <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                    <span className="grid size-12 place-items-center rounded-2xl border border-neon/35 bg-neon/10 text-neon">
                      <MessageSquareWarning className="size-6" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-black text-white">
                      {locale === "ro"
                        ? `Găsește toate cele ${totalFlagsInCase} semnale de alarmă în SMS`
                        : `Найди все ${totalFlagsInCase} красных флага в тексте SMS слева`}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                      {locale === "ro"
                        ? "Citește cu atenție fiecare frază a mesajului și apasă pe părțile care conțin urgență falsă, cereri de plată sau linkuri suspecte."
                        : "Внимательно прочитай каждое предложение в сообщении и нажми на фразы с ложной срочностью, требованием оплаты или подозрительным адресом сайта."}
                    </p>
                    <div className="mt-4 w-full space-y-1.5 text-left">
                      {currentCase.segments
                        .filter((s) => s.isFlag)
                        .map((flag, idx) => {
                          const found = foundFlagIds.includes(flag.id);
                          return (
                            <div
                              key={flag.id}
                              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                                found
                                  ? "border-success/40 bg-success/10 font-bold text-success"
                                  : "border-slate-700 bg-slate-900/50 text-slate-400"
                              }`}
                            >
                              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                              <span>
                                {found && flag.flagTitle
                                  ? flag.flagTitle[locale]
                                  : locale === "ro"
                                    ? `Indiciul #${idx + 1} (încă negăsit)`
                                    : `Улика №${idx + 1} (ещё не отмечена в SMS)`}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-3 py-2 text-xs font-bold text-success">
                        <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                        <span>{ui.allFlagsFound}</span>
                      </div>

                      <h3 className="mt-3 text-sm font-black text-white">
                        {currentCase.question[locale]}
                      </h3>

                      <div className="mt-2.5 space-y-2">
                        {currentCase.options.map((option, idx) => {
                          const isChosen = selectedOptionId === option.id;
                          const chosenCorrect = isChosen && option.correct;
                          const chosenWrong = isChosen && !option.correct;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setSelectedOptionId(option.id)}
                              aria-pressed={isChosen}
                              className={`focus-ring block w-full rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold leading-relaxed transition ${
                                chosenCorrect
                                  ? "border-success bg-success/20 text-white"
                                  : chosenWrong
                                    ? "border-danger bg-danger/20 text-amber-100"
                                    : "border-neon/30 bg-[#0a1528] text-slate-100 hover:border-neon hover:bg-neon/10"
                              }`}
                            >
                              {idx + 1}. {option.text[locale]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedOption && (
                      <div className="space-y-2.5">
                        <div
                          className={`rounded-xl border p-3 text-xs leading-relaxed ${
                            selectedOption.correct
                              ? "border-success/50 bg-success/15 text-emerald-100"
                              : "border-danger/50 bg-danger/15 text-amber-100"
                          }`}
                          role="status"
                          aria-live="polite"
                        >
                          <p className="flex items-center gap-1.5 font-black">
                            {selectedOption.correct ? (
                              <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
                            ) : (
                              <ShieldAlert className="size-4 shrink-0 text-danger" aria-hidden="true" />
                            )}
                            {selectedOption.feedback[locale]}
                          </p>
                          {!selectedOption.correct && (
                            <p className="mt-1 font-semibold text-amber-200">{ui.retryOptionHint}</p>
                          )}
                        </div>

                        {selectedOption.correct && (
                          <button
                            type="button"
                            onClick={handleNextCase}
                            className="focus-ring inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-neon px-4 text-xs font-black text-slate-950 shadow-lg transition hover:brightness-110 sm:text-sm"
                          >
                            {caseIndex + 1 < DELIVERY_SMS_CASES.length
                              ? ui.nextSmsBtn
                              : ui.finishTrainingBtn}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "summary" && (
            <div className="mx-auto max-w-2xl space-y-4 py-2 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-success/50 bg-success/15 text-success">
                <ShieldCheck className="size-8" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-black text-success sm:text-2xl">{ui.summaryTitle}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">
                  {ui.summarySubtitle}
                </p>
                <p className="mt-2 inline-block rounded-full border border-neon/40 bg-neon/10 px-4 py-1 text-xs font-black text-neon">
                  {ui.summaryScoreLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-neon/30 bg-[#112240]/80 p-4 text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-gold sm:text-sm">
                  {ui.summaryChecklistTitle}
                </h3>
                <ul className="mt-2.5 space-y-2">
                  {ui.summaryChecklist.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-slate-100 sm:text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onComplete(true)}
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-success px-6 text-sm font-black text-slate-950 shadow-lg transition hover:brightness-110"
              >
                <span>{ui.completePatrolBtn}</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
