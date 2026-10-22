"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Info,
  Lightbulb,
  MessageSquareWarning,
  Pause,
  Play,
  RotateCcw,
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

const CLUE_TIMER_SECONDS = 35;
const CLUE_BONUS_SECONDS = 4;
const CLUE_PENALTY_SECONDS = 3;
const HINT_PENALTY_SECONDS = 5;

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

  // Обратный отсчёт времени на сбор улик
  const [secondsLeft, setSecondsLeft] = useState(CLUE_TIMER_SECONDS);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timeDeltaBadge, setTimeDeltaBadge] = useState<{
    text: string;
    positive: boolean;
  } | null>(null);

  const currentCase = DELIVERY_SMS_CASES[caseIndex] ?? DELIVERY_SMS_CASES[0];
  const totalFlagsInCase = currentCase.segments.filter((segment) => segment.isFlag).length;
  const allFlagsFound = foundFlagIds.length >= totalFlagsInCase;
  const isTimedOut = step === "practice" && !allFlagsFound && secondsLeft <= 0;
  const selectedOption = currentCase.options.find((opt) => opt.id === selectedOptionId) ?? null;
  const currentCaseSolved = Boolean(selectedOption?.correct);

  // Расчёт общего прогресса расследования:
  // Всего 13 микро-задач: 1 (памятка) + 3 кейса * (3 улики + 1 решение) = 13
  const totalCases = DELIVERY_SMS_CASES.length; // 3
  const totalCluesAllCases = totalCases * 3; // 9
  const totalTasks = 1 + totalCases * 4; // 13

  const completedTheoryTasks = step === "theory" ? 0 : 1;
  const completedPreviousCaseTasks = step === "summary" ? totalCases * 4 : caseIndex * 4;
  const currentCaseTasks =
    step === "practice" ? foundFlagIds.length + (currentCaseSolved ? 1 : 0) : 0;

  const completedTasks =
    step === "summary"
      ? totalTasks
      : completedTheoryTasks + completedPreviousCaseTasks + currentCaseTasks;
  const remainingTasks = Math.max(0, totalTasks - completedTasks);
  const progressPercent = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

  const totalFoundClues =
    step === "summary"
      ? totalCluesAllCases
      : step === "practice"
        ? caseIndex * 3 + foundFlagIds.length
        : 0;
  const solvedSmsCount =
    step === "summary" ? totalCases : caseIndex + (currentCaseSolved ? 1 : 0);

  // Тик таймера во время сбора улик
  useEffect(() => {
    if (step !== "practice" || allFlagsFound || timerPaused || secondsLeft <= 0) {
      return;
    }
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [step, allFlagsFound, timerPaused, secondsLeft]);

  // Автоскрытие бейджа +4 сек / -3 сек
  useEffect(() => {
    if (!timeDeltaBadge) return;
    const timeout = window.setTimeout(() => setTimeDeltaBadge(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [timeDeltaBadge]);

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

  function startPracticeStep() {
    setStep("practice");
    setSecondsLeft(CLUE_TIMER_SECONDS);
    setTimerPaused(false);
    setTimeDeltaBadge(null);
  }

  function handleSegmentClick(segment: SmsSegment) {
    if (isTimedOut) return;
    setActiveSegment(segment);

    if (segment.isFlag) {
      if (!foundFlagIds.includes(segment.id)) {
        const nextFound = [...foundFlagIds, segment.id];
        setFoundFlagIds(nextFound);
        if (nextFound.length < totalFlagsInCase) {
          setSecondsLeft((prev) => Math.min(CLUE_TIMER_SECONDS, prev + CLUE_BONUS_SECONDS));
          setTimeDeltaBadge({ text: ui.bonusTimeNotice, positive: true });
        } else {
          setTimeDeltaBadge({ text: ui.timerLocked, positive: true });
        }
      }
    } else if (!allFlagsFound) {
      setSecondsLeft((prev) => Math.max(0, prev - CLUE_PENALTY_SECONDS));
      setTimeDeltaBadge({ text: ui.penaltyTimeNotice, positive: false });
    }
  }

  function handleUseHint() {
    if (allFlagsFound || isTimedOut) return;
    const nextUnfoundFlag = currentCase.segments.find(
      (seg) => seg.isFlag && !foundFlagIds.includes(seg.id),
    );
    if (!nextUnfoundFlag) return;

    const nextFound = [...foundFlagIds, nextUnfoundFlag.id];
    setFoundFlagIds(nextFound);
    setActiveSegment(nextUnfoundFlag);
    if (nextFound.length < totalFlagsInCase) {
      setSecondsLeft((prev) => Math.max(1, prev - HINT_PENALTY_SECONDS));
    }
  }

  function handleRetryCurrentCaseTimer() {
    setFoundFlagIds([]);
    setActiveSegment(null);
    setSelectedOptionId(null);
    setSecondsLeft(CLUE_TIMER_SECONDS);
    setTimerPaused(false);
    setTimeDeltaBadge(null);
  }

  function handleNextCase() {
    if (caseIndex + 1 < DELIVERY_SMS_CASES.length) {
      setCaseIndex((prev) => prev + 1);
      setFoundFlagIds([]);
      setActiveSegment(null);
      setSelectedOptionId(null);
      setSecondsLeft(CLUE_TIMER_SECONDS);
      setTimerPaused(false);
      setTimeDeltaBadge(null);
    } else {
      setStep("summary");
    }
  }

  const timerPercent = Math.min(100, Math.round((secondsLeft / CLUE_TIMER_SECONDS) * 100));
  const timerColorClass = allFlagsFound
    ? "text-success border-success/45 bg-success/15"
    : secondsLeft <= 7
      ? "text-danger border-danger/60 bg-danger/20 animate-pulse"
      : secondsLeft <= 14
        ? "text-gold border-gold/50 bg-gold/15"
        : "text-neon border-neon/40 bg-neon/10";

  const timerBarColorClass = allFlagsFound
    ? "bg-success"
    : secondsLeft <= 7
      ? "bg-danger"
      : secondsLeft <= 14
        ? "bg-gold"
        : "bg-neon";

  const formattedTimer = `00:${String(secondsLeft).padStart(2, "0")}`;

  const checkpoints = [
    {
      id: "cp-theory",
      label: locale === "ro" ? "1. Ghid" : "1. Памятка",
      done: step !== "theory",
      active: step === "theory",
      sub: step === "theory" ? (locale === "ro" ? "4 reguli" : "4 правила") : "✓",
    },
    {
      id: "cp-sms-1",
      label: locale === "ro" ? "2. SMS #1 (Vamă)" : "2. SMS №1 (Пошлина)",
      done: step === "summary" || (step === "practice" && (caseIndex > 0 || (caseIndex === 0 && currentCaseSolved))),
      active: step === "practice" && caseIndex === 0,
      sub:
        step === "practice" && caseIndex === 0
          ? `${foundFlagIds.length}/3`
          : step === "summary" || caseIndex > 0
            ? "✓"
            : "0/3",
    },
    {
      id: "cp-sms-2",
      label: locale === "ro" ? "3. SMS #2 (Curier)" : "3. SMS №2 (Курьер)",
      done: step === "summary" || (step === "practice" && (caseIndex > 1 || (caseIndex === 1 && currentCaseSolved))),
      active: step === "practice" && caseIndex === 1,
      sub:
        step === "practice" && caseIndex === 1
          ? `${foundFlagIds.length}/3`
          : step === "summary" || caseIndex > 1
            ? "✓"
            : "0/3",
    },
    {
      id: "cp-sms-3",
      label: locale === "ro" ? "4. SMS #3 (Retur)" : "4. SMS №3 (Возврат)",
      done: step === "summary" || (step === "practice" && caseIndex === 2 && currentCaseSolved),
      active: step === "practice" && caseIndex === 2,
      sub:
        step === "practice" && caseIndex === 2
          ? `${foundFlagIds.length}/3`
          : step === "summary"
            ? "✓"
            : "0/3",
    },
    {
      id: "cp-summary",
      label: locale === "ro" ? "5. Finalizare" : "5. Итог",
      done: step === "summary",
      active: step === "summary",
      sub: step === "summary" ? "100%" : locale === "ro" ? "Scut" : "Щит",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#040916]/90 p-2 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={DELIVERY_SMS_THEORY.title[locale]}
    >
      <div className="flex h-[94vh] max-h-[860px] w-[96vw] max-w-[1380px] flex-col overflow-hidden rounded-3xl border-2 border-neon/75 bg-[#0a1528] text-foreground shadow-[0_0_70px_rgba(0,217,255,0.25)]">
        {/* Верхняя шапка + шкала прогресса расследования */}
        <div className="shrink-0 border-b border-neon/25 bg-[#060d1f] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl border border-neon/40 bg-neon/10 text-neon">
                <Smartphone className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-neon">
                  {DELIVERY_SMS_THEORY.categoryBadge[locale]}
                </p>
                <p className="text-xs font-bold text-gold">
                  {locale === "ro"
                    ? "Maria · Oficiul Poștal · Investigație interactivă"
                    : "Мария · Район Почты · Интерактивное расследование"}
                </p>
              </div>
            </div>

            {/* Сводка оставшихся задач */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-lg border border-neon/35 bg-neon/10 px-2.5 py-1 text-neon">
                {locale === "ro"
                  ? `SMS analizate: ${solvedSmsCount} / ${totalCases}`
                  : `Разобрано SMS: ${solvedSmsCount} / ${totalCases}`}
              </span>
              <span className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1 text-gold">
                {locale === "ro"
                  ? `Indicii: ${totalFoundClues} / ${totalCluesAllCases}`
                  : `Улики: ${totalFoundClues} / ${totalCluesAllCases}`}
              </span>
              <span className="rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-slate-200">
                {remainingTasks === 0
                  ? locale === "ro"
                    ? "Toate sarcinile finalizate!"
                    : "Все задачи выполнены!"
                  : locale === "ro"
                    ? `Sarcini rămase: ${remainingTasks}`
                    : `Осталось задач: ${remainingTasks}`}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label={ui.closeLabel}
                className="focus-ring ml-1 inline-flex size-8 items-center justify-center rounded-xl border border-border bg-card/80 text-muted-foreground transition hover:border-neon hover:text-neon"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Прогресс-бар расследования и этапы */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span>
                {locale === "ro"
                  ? `Progresul investigației (${completedTasks} din ${totalTasks} pași)`
                  : `Ход расследования (${completedTasks} из ${totalTasks} шагов)`}
              </span>
              <span className="font-mono text-xs font-black text-neon">{progressPercent}%</span>
            </div>
            <div
              className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-800 p-0.5"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={locale === "ro" ? "Progresul investigației" : "Прогресс расследования"}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon via-cyan-300 to-success transition-[width] duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Чекпоинты расследования */}
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {checkpoints.map((cp) => (
                <div
                  key={cp.id}
                  className={`flex items-center justify-between rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                    cp.active
                      ? "border-neon bg-neon/15 text-white shadow-[0_0_12px_rgba(0,217,255,0.2)]"
                      : cp.done
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}
                >
                  <span className="truncate">{cp.label}</span>
                  <span
                    className={`ml-1 shrink-0 rounded px-1.5 py-0.2 font-mono text-[10px] font-black ${
                      cp.done
                        ? "bg-success/20 text-success"
                        : cp.active
                          ? "bg-neon text-slate-950"
                          : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {cp.done ? <Check className="inline size-3" aria-hidden="true" /> : cp.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Основная рабочая область */}
        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
          {step === "theory" && (
            <div className="flex h-full flex-col justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white sm:text-2xl">
                  {DELIVERY_SMS_THEORY.title[locale]}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {DELIVERY_SMS_THEORY.subtitle[locale]}
                </p>
              </div>

              <div className="grid flex-1 items-stretch gap-3 sm:grid-cols-2">
                {DELIVERY_SMS_THEORY.rules.map((rule) => (
                  <article
                    key={rule.id}
                    className="flex flex-col justify-between rounded-2xl border border-neon/25 bg-[#112240]/85 p-4"
                  >
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-black text-neon sm:text-base">
                        <BookOpen className="size-4 shrink-0" aria-hidden="true" />
                        {rule.title[locale]}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-200 sm:text-sm">
                        {rule.description[locale]}
                      </p>
                    </div>
                    <p className="mt-3 rounded-xl border border-danger/35 bg-danger/10 px-3 py-2 text-xs font-semibold text-amber-200">
                      {rule.example[locale]}
                    </p>
                  </article>
                ))}
              </div>

              <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 sm:flex-row sm:items-center">
                <p className="text-xs font-bold leading-relaxed text-amber-100 sm:text-sm">
                  {DELIVERY_SMS_THEORY.goldenRule[locale]}
                </p>
                <button
                  type="button"
                  onClick={startPracticeStep}
                  className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-slate-950 shadow-lg transition hover:brightness-110"
                >
                  {ui.startPracticeBtn}
                </button>
              </div>
            </div>
          )}

          {step === "practice" && (
            <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              {/* Левая колонка: экран смартфона с интерактивным текстом SMS + таймер */}
              <div className="flex flex-col justify-between rounded-2xl border border-neon/35 bg-[#060d1f] p-4">
                <div>
                  {/* Верхняя строка карточки SMS + Интерактивный таймер обратного отсчёта */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                    <span className="rounded-full border border-gold/45 bg-gold/15 px-3 py-0.5 text-xs font-black text-gold">
                      {currentCase.badge[locale]}
                    </span>

                    <div className="flex items-center gap-2">
                      {timeDeltaBadge && (
                        <span
                          className={`rounded-lg border px-2 py-0.5 text-[11px] font-black ${
                            timeDeltaBadge.positive
                              ? "border-success/50 bg-success/20 text-success"
                              : "border-danger/60 bg-danger/20 text-amber-200"
                          }`}
                        >
                          {timeDeltaBadge.text}
                        </span>
                      )}

                      <div
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 font-mono text-xs font-black ${timerColorClass}`}
                      >
                        <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          {allFlagsFound
                            ? ui.timerLocked
                            : timerPaused
                              ? `${formattedTimer} (${ui.timerPaused})`
                              : formattedTimer}
                        </span>
                      </div>

                      {!allFlagsFound && !isTimedOut && (
                        <button
                          type="button"
                          onClick={() => setTimerPaused((prev) => !prev)}
                          aria-label={timerPaused ? ui.resumeBtn : ui.pauseBtn}
                          title={timerPaused ? ui.resumeBtn : ui.pauseBtn}
                          className="focus-ring inline-flex size-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 text-slate-200 transition hover:border-neon hover:text-neon"
                        >
                          {timerPaused ? (
                            <Play className="size-3.5" aria-hidden="true" />
                          ) : (
                            <Pause className="size-3.5" aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Полоска обратного отсчёта времени на поиск улик */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="shrink-0 text-[11px] font-bold text-slate-400">
                      {ui.timerLabel}:
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-[width] duration-300 ${timerBarColorClass}`}
                        style={{ width: `${allFlagsFound ? 100 : timerPercent}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-bold text-slate-300">
                      {ui.flagsCounter}:{" "}
                      <strong className={allFlagsFound ? "text-success" : "text-amber-300"}>
                        {foundFlagIds.length}/{totalFlagsInCase}
                      </strong>
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                    {currentCase.context[locale]}
                  </p>

                  {/* Экран входящего SMS */}
                  <div className="mt-2 rounded-2xl border border-slate-700 bg-[#0f1d36] p-3.5 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 text-xs">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                          {ui.incomingSmsLabel}
                        </span>
                        <span className="font-mono text-sm font-black text-white">
                          {currentCase.sender}
                        </span>
                      </div>
                      <span className="rounded-md bg-slate-800 px-2.5 py-0.5 font-mono text-xs text-slate-300">
                        {currentCase.time}
                      </span>
                    </div>

                    {/* Фрагменты текста SMS */}
                    <div className="mt-2.5 space-y-2">
                      {currentCase.segments.map((segment) => {
                        const isFound = foundFlagIds.includes(segment.id);
                        const isSelected = activeSegment?.id === segment.id;

                        return (
                          <button
                            key={segment.id}
                            type="button"
                            disabled={isTimedOut}
                            onClick={() => handleSegmentClick(segment)}
                            aria-pressed={isFound}
                            className={`focus-ring block w-full rounded-xl border px-3.5 py-2 text-left text-xs leading-relaxed transition sm:text-sm ${
                              isTimedOut
                                ? "cursor-not-allowed border-slate-800 bg-slate-900/50 text-slate-500"
                                : isFound
                                  ? "border-danger bg-danger/20 font-bold text-amber-100 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                                  : isSelected && !segment.isFlag
                                    ? "border-amber-500/60 bg-amber-500/10 text-amber-100"
                                    : "border-slate-700 bg-[#162847] text-slate-100 hover:border-neon/60 hover:bg-[#1c3258]"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span>{segment.text[locale]}</span>
                              {isFound && (
                                <span className="shrink-0 rounded-md bg-danger px-2 py-0.5 text-[10px] font-black uppercase text-white">
                                  {locale === "ro" ? "Semnal ✓" : "Улика ✓"}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Пояснение по кликнутому фрагменту */}
                <div className="mt-2">
                  {activeSegment ? (
                    <div
                      className={`rounded-xl border px-3.5 py-2 text-xs leading-relaxed sm:text-sm ${
                        activeSegment.isFlag
                          ? "border-danger/50 bg-danger/15 text-amber-100"
                          : "border-amber-500/50 bg-amber-500/10 text-amber-100"
                      }`}
                      role="status"
                      aria-live="polite"
                    >
                      <p className="flex items-center gap-1.5 font-black">
                        {activeSegment.isFlag ? (
                          <AlertTriangle className="size-4 shrink-0 text-danger" aria-hidden="true" />
                        ) : (
                          <Info className="size-4 shrink-0 text-gold" aria-hidden="true" />
                        )}
                        {activeSegment.flagTitle
                          ? activeSegment.flagTitle[locale]
                          : locale === "ro"
                            ? "Frază neutră (−3 sec)"
                            : "Нейтральная фраза (−3 сек)"}
                      </p>
                      <p className="mt-0.5">{activeSegment.explanation[locale]}</p>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-neon/35 bg-neon/5 px-3.5 py-2 text-xs text-neon sm:text-sm">
                      {ui.clickHint}
                    </p>
                  )}
                </div>
              </div>

              {/* Правая колонка: список улик / экран тайм-аута / выбор безопасного решения */}
              <div className="flex flex-col justify-between rounded-2xl border border-neon/25 bg-[#112240]/75 p-4">
                {isTimedOut ? (
                  <div className="flex h-full flex-col items-center justify-center p-4 text-center" role="alert">
                    <span className="grid size-14 place-items-center rounded-2xl border border-danger/50 bg-danger/15 text-danger">
                      <Clock className="size-8 animate-bounce" aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 text-lg font-black text-danger sm:text-xl">
                      {ui.timeoutTitle}
                    </h3>
                    <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-200 sm:text-sm">
                      {ui.timeoutDesc}
                    </p>
                    <button
                      type="button"
                      onClick={handleRetryCurrentCaseTimer}
                      className="focus-ring mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-slate-950 shadow-lg transition hover:brightness-110"
                    >
                      <RotateCcw className="size-4" aria-hidden="true" />
                      <span>{ui.retryTimerBtn}</span>
                    </button>
                  </div>
                ) : !allFlagsFound ? (
                  <div className="flex h-full flex-col justify-between">
                    <div className="text-center">
                      <span className="mx-auto grid size-11 place-items-center rounded-2xl border border-neon/35 bg-neon/10 text-neon">
                        <MessageSquareWarning className="size-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-2 text-base font-black text-white sm:text-lg">
                        {locale === "ro"
                          ? `Pasul A: Găsește cele ${totalFlagsInCase} semnale înainte să expire timpul`
                          : `Этап А: Найди все ${totalFlagsInCase} красных флага до окончания таймера`}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">
                        {locale === "ro"
                          ? "Fiecare indiciu găsit îți oferă +4 secunde bonus. Atenție la frazele neutre (−3 secunde)!"
                          : "Каждая верная улика даёт +4 секунды бонуса. Осторожно: клик по нейтральной фразе отнимает 3 секунды!"}
                      </p>
                    </div>

                    <div className="my-auto space-y-2 py-2">
                      {currentCase.segments
                        .filter((s) => s.isFlag)
                        .map((flag, idx) => {
                          const found = foundFlagIds.includes(flag.id);
                          return (
                            <div
                              key={flag.id}
                              className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-xs transition sm:text-sm ${
                                found
                                  ? "border-success/45 bg-success/10 text-emerald-100"
                                  : "border-slate-700 bg-slate-900/55 text-slate-400"
                              }`}
                            >
                              <CheckCircle2
                                className={`mt-0.5 size-4 shrink-0 ${found ? "text-success" : "text-slate-500"}`}
                                aria-hidden="true"
                              />
                              <div>
                                <p className="font-black">
                                  {found && flag.flagTitle
                                    ? flag.flagTitle[locale]
                                    : locale === "ro"
                                      ? `Indiciul #${idx + 1} (apasă pe fraza suspectă în SMS)`
                                      : `Улика №${idx + 1} (нажми на подозрительную фразу в SMS)`}
                                </p>
                                {found && (
                                  <p className="mt-0.5 text-xs text-slate-200">{flag.explanation[locale]}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
                      <span>
                        {locale === "ro"
                          ? `Indicii rămase în acest SMS: ${totalFlagsInCase - foundFlagIds.length}`
                          : `Осталось найти улик в этом SMS: ${totalFlagsInCase - foundFlagIds.length}`}
                      </span>
                      <button
                        type="button"
                        onClick={handleUseHint}
                        className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-gold/45 bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold transition hover:bg-gold/25"
                      >
                        <Lightbulb className="size-3.5" aria-hidden="true" />
                        <span>{ui.hintBtn}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-3 py-2 text-xs font-bold text-success sm:text-sm">
                        <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                        <span>{ui.allFlagsFound}</span>
                      </div>

                      <h3 className="mt-3 text-sm font-black text-white sm:text-base">
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
                              className={`focus-ring block w-full rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold leading-relaxed transition sm:text-sm ${
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
                          className={`rounded-xl border p-3 text-xs leading-relaxed sm:text-sm ${
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
                            className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-neon px-5 text-sm font-black text-slate-950 shadow-lg transition hover:brightness-110"
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
            <div className="mx-auto flex h-full max-w-3xl flex-col justify-between py-2 text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-success/50 bg-success/15 text-success">
                  <ShieldCheck className="size-8" aria-hidden="true" />
                </span>
                <h2 className="mt-3 text-2xl font-black text-success">{ui.summaryTitle}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-200">{ui.summarySubtitle}</p>
                <p className="mt-2.5 inline-block rounded-full border border-neon/40 bg-neon/10 px-4 py-1 text-xs font-black text-neon sm:text-sm">
                  {ui.summaryScoreLabel}
                </p>
              </div>

              <div className="my-auto rounded-2xl border border-neon/30 bg-[#112240]/85 p-5 text-left">
                <h3 className="text-sm font-black uppercase tracking-wider text-gold">
                  {ui.summaryChecklistTitle}
                </h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {ui.summaryChecklist.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 rounded-xl border border-slate-700/80 bg-[#0a1528]/80 p-3 text-xs leading-relaxed text-slate-100 sm:text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onComplete(true)}
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-success px-8 text-base font-black text-slate-950 shadow-lg transition hover:brightness-110"
                >
                  <span>{ui.completePatrolBtn}</span>
                  <ArrowRight className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
