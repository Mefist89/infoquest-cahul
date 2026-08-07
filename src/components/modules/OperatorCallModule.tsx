"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  ListChecks,
  ListOrdered,
  Loader2,
  Lock,
  MessageSquare,
  Play,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Video,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

import { operatorCallContent, type OperatorLocale } from "@/data/operator-call";
import { createClient } from "@/lib/supabase/client";

type StageProgress = { stage_index: number; status: "not_started" | "in_progress" | "completed"; score: number };
type ModuleProgress = { status: "not_started" | "in_progress" | "completed"; xp: number; score: number } | null;

const stageIcons: LucideIcon[] = [BookOpen, Clapperboard, Video, ScanSearch, ListChecks, MessageSquare, ListOrdered, ShieldAlert];

export function OperatorCallModule({ locale, initialStages, initialModule }: { locale: OperatorLocale; initialStages: StageProgress[]; initialModule: ModuleProgress }) {
  const t = operatorCallContent[locale];
  const initialCompleted = initialStages.filter((stage) => stage.status === "completed").map((stage) => stage.stage_index);
  const firstOpenStage = Array.from({ length: 8 }, (_, index) => index + 1).find((stage) => !initialCompleted.includes(stage)) ?? 8;
  const [completedStages, setCompletedStages] = useState(() => new Set(initialCompleted));
  const [currentStage, setCurrentStage] = useState(initialCompleted.length === 0 ? 0 : firstOpenStage);
  const [moduleXp, setModuleXp] = useState(initialModule?.xp ?? 0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [classification, setClassification] = useState<Record<string, "safe" | "danger">>({});
  const [orderedActions, setOrderedActions] = useState<string[]>([]);
  const [finalAnswers, setFinalAnswers] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ stage: number; score: number; passed?: boolean } | null>(null);

  const unlockedThrough = useMemo(() => {
    for (let stage = 1; stage <= 8; stage += 1) {
      if (!completedStages.has(stage)) return stage;
    }
    return 8;
  }, [completedStages]);

  const completionPercent = Math.round((completedStages.size / 8) * 100);

  async function completeStage(stageIndex: number, score = 100) {
    if (saving) return false;
    setSaving(true);
    setNotice(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("complete_module_stage", {
      p_module_id: "operator-call",
      p_stage_index: stageIndex,
      p_score: Math.max(0, Math.min(100, Math.round(score))),
    });
    setSaving(false);

    if (error) {
      setNotice({ kind: "error", text: t.saveError });
      return false;
    }

    const result = Array.isArray(data) ? data[0] : null;
    setCompletedStages((previous) => new Set(previous).add(stageIndex));
    setModuleXp(Number(result?.module_xp ?? moduleXp));
    setNotice({ kind: "success", text: t.saved });
    return true;
  }

  function chooseStage(stage: number) {
    setCurrentStage(stage);
    setFeedback(null);
    setNotice(null);
  }

  async function submitCallSimulator() {
    setFeedback({ stage: 4, score: 100 });
    await completeStage(4, 100);
  }

  async function submitClassification() {
    const correct = t.classify.items.filter((item) => classification[item.id] === item.answer).length;
    const score = Math.round((correct / t.classify.items.length) * 100);
    setFeedback({ stage: 5, score });
    await completeStage(5, score);
  }

  async function submitDialogue() {
    setFeedback({ stage: 6, score: 100 });
    await completeStage(6, 100);
  }

  async function submitOrdering() {
    const correctPositions = orderedActions.filter((action, index) => action === t.ordering.correct[index]).length;
    const score = Math.round((correctPositions / t.ordering.correct.length) * 100);
    setFeedback({ stage: 7, score });
    await completeStage(7, score);
  }

  async function submitFinal() {
    const correct = t.final.questions.filter((question) => finalAnswers[question.id] === question.answer).length;
    const score = correct * 20;
    const passed = score >= 80;
    setFeedback({ stage: 8, score, passed });
    if (passed) await completeStage(8, score);
  }

  return (
    <main className="circuit-bg min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center gap-3">
          <Link href={`/${locale}`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-neon transition hover:border-neon/60">
            <ArrowLeft className="size-4" aria-hidden="true" /> {t.back}
          </Link>
          <Link href={`/${locale}/profile`} className="focus-ring ml-auto inline-flex min-h-11 items-center rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-muted-foreground transition hover:border-neon/60 hover:text-foreground">{t.profile}</Link>
          <nav className="flex rounded-full border border-border bg-card/70 p-1" aria-label="Language">
            {(["ro", "ru"] as const).map((language) => <Link key={language} href={`/${language}/modules/operator-call`} className={`focus-ring rounded-full px-3 py-2 text-xs font-bold uppercase ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground"}`}>{language}</Link>)}
          </nav>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-3xl border border-neon/30 bg-card/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-neon/10 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neon">{t.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-black sm:text-5xl">{t.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HeaderStat label={t.completed} value={`${completedStages.size}/8`} icon={CheckCircle2} />
              <HeaderStat label={t.xp} value={`${moduleXp}/100`} icon={Sparkles} />
            </div>
          </div>
          <div className="relative mt-6 h-2.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={completedStages.size} aria-valuemin={0} aria-valuemax={8} aria-label={t.progress}>
            <div className="h-full rounded-full bg-neon transition-[width] duration-500" style={{ width: `${completionPercent}%` }} />
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-border bg-card/70 p-4 lg:sticky lg:top-24 lg:self-start">
            <p className="px-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{t.progress}</p>
            <button type="button" onClick={() => chooseStage(0)} className={`focus-ring mt-3 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${currentStage === 0 ? "border-neon/60 bg-neon/10" : "border-border bg-background/25"}`}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${currentStage === 0 ? "bg-neon/15 text-neon" : "bg-secondary text-muted-foreground"}`}><MessageSquare className="size-4" /></span>
              <span className="min-w-0"><span className="block text-xs text-muted-foreground">Intro</span><span className="block truncate text-sm font-bold text-foreground">{t.intro.title}</span></span>
            </button>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {t.stages.map((stage, index) => {
                const number = index + 1;
                const Icon = stageIcons[index];
                const done = completedStages.has(number);
                const locked = false;
                const active = currentStage === number;
                return (
                  <li key={stage.title}>
                    <button type="button" onClick={() => chooseStage(number)} disabled={locked} className={`focus-ring flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-neon/60 bg-neon/10" : done ? "border-success/30 bg-success/5" : "border-border bg-background/25"} disabled:cursor-not-allowed disabled:opacity-45`}>
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${done ? "bg-success/15 text-success" : active ? "bg-neon/15 text-neon" : "bg-secondary text-muted-foreground"}`}>{locked ? <Lock className="size-4" /> : done ? <Check className="size-4" /> : <Icon className="size-4" />}</span>
                      <span className="min-w-0"><span className="block text-xs text-muted-foreground">{number}/8</span><span className="block truncate text-sm font-bold text-foreground">{stage.title}</span></span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          <section className="min-h-[34rem] rounded-3xl border border-border bg-card/75 p-5 sm:p-8">
            {currentStage === 0 ? (
              <StageHeading number={0} title={t.intro.title} subtitle={t.intro.subtitle} done={false} />
            ) : (
              <StageHeading number={currentStage} title={t.stages[currentStage - 1].title} subtitle={t.stages[currentStage - 1].subtitle} done={completedStages.has(currentStage)} />
            )}
            <div className="mt-7">
              {currentStage === 0 && <IntroStage content={t.intro} locale={locale} onFinish={() => setCurrentStage(firstOpenStage)} />}
              {currentStage === 1 && <TheoryStage content={t.theory} button={t.continue} saving={saving} onComplete={() => completeStage(1)} />}
              {currentStage === 2 && <VideoExplanationStage content={t.videoExplanation} button={t.continue} saving={saving} onComplete={() => completeStage(2)} />}
              {currentStage === 3 && <VideoExampleStage content={t.videoExample} button={t.continue} saving={saving} onComplete={() => completeStage(3)} />}
              {currentStage === 4 && <CallSimulatorStage locale={locale} content={t.callSimulator} check={t.continue} saving={saving} feedback={feedback?.stage === 4 ? feedback : null} onSubmit={submitCallSimulator} />}
              {currentStage === 5 && <ClassifyStage content={t.classify} answers={classification} setAnswers={setClassification} check={t.check} saving={saving} feedback={feedback?.stage === 5 ? feedback : null} onSubmit={submitClassification} />}
              {currentStage === 6 && <DialogueStage content={t.dialogue} check={t.continue} saving={saving} feedback={feedback?.stage === 6 ? feedback : null} onSubmit={submitDialogue} />}
              {currentStage === 7 && <OrderingStage content={t.ordering} ordered={orderedActions} setOrdered={setOrderedActions} check={t.check} retry={t.retry} saving={saving} feedback={feedback?.stage === 7 ? feedback : null} onSubmit={submitOrdering} />}
              {currentStage === 8 && <FinalStage content={t.final} answers={finalAnswers} setAnswers={setFinalAnswers} check={t.check} retry={t.retry} saving={saving} feedback={feedback?.stage === 8 ? feedback : null} onSubmit={submitFinal} />}
            </div>

            {notice && <p className={`mt-6 rounded-xl border px-4 py-3 text-sm ${notice.kind === "success" ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"}`}>{notice.text}</p>}
            {completedStages.has(currentStage) && currentStage < 8 && (
              <button type="button" onClick={() => chooseStage(currentStage + 1)} className="focus-ring mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-5 text-sm font-black text-neon transition hover:border-neon hover:bg-neon/20">
                {t.next}<ChevronRight className="size-4" aria-hidden="true" />
              </button>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function HeaderStat({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return <div className="min-w-32 rounded-2xl border border-border bg-background/35 p-4"><Icon className="size-4 text-gold" /><p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-display text-xl font-black text-foreground">{value}</p></div>;
}

function StageHeading({ number, title, subtitle, done }: { number: number; title: string; subtitle: string; done: boolean }) {
  return <div className="flex items-start gap-4"><span className={`grid size-12 shrink-0 place-items-center rounded-2xl border font-display font-black ${done ? "border-success/40 bg-success/10 text-success" : "border-neon/40 bg-neon/10 text-neon"}`}>{done ? <Check className="size-5" /> : number === 0 ? <MessageSquare className="size-5" /> : number}</span><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{number === 0 ? "Intro" : `${number}/8`}</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{subtitle}</p></div></div>;
}

function IntroStage({ content, locale, onFinish }: { content: (typeof operatorCallContent)["ru"]["intro"] | (typeof operatorCallContent)["ro"]["intro"]; locale: OperatorLocale; onFinish: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const lastLine = lineIndex === content.lines.length - 1;
  const fullText = content.lines[lineIndex];
  const finishTyping = useCallback(() => setTypingDone(true), []);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function listen() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = locale === "ru" ? "ru-RU" : "ro-RO";
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function advance() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    if (lastLine) {
      onFinish();
      return;
    }
    setTypingDone(false);
    setLineIndex((index) => index + 1);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neon/25 bg-[radial-gradient(circle_at_25%_60%,rgba(0,217,255,0.13),transparent_42%),rgba(2,10,30,0.72)]">
      <div className="grid min-h-[31rem] items-end gap-2 px-5 pt-6 sm:grid-cols-[minmax(13rem,0.75fr)_minmax(18rem,1.25fr)] sm:px-8">
        <div className="relative mx-auto h-72 w-full max-w-64 self-end sm:h-[30rem] sm:max-w-sm">
          <Image src="/characters/02_woman_glasses_book_left.png" alt={content.name} fill sizes="(max-width: 640px) 256px, 384px" className="object-contain object-bottom drop-shadow-[0_0_28px_rgba(0,217,255,0.22)]" priority />
        </div>
        <div className="relative z-10 self-center pb-8 sm:pb-0">
          <div className="rounded-3xl rounded-bl-md border border-neon/35 bg-card/95 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.35)] sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neon">{content.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{content.role}</p>
            <p className="sr-only">{fullText}</p>
            <TypewriterText key={lineIndex} text={fullText} onDone={finishTyping} />
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex gap-1.5" aria-label={`${lineIndex + 1}/${content.lines.length}`}>{content.lines.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === lineIndex ? "w-7 bg-neon" : index < lineIndex ? "w-3 bg-success" : "w-3 bg-secondary"}`} />)}</div>
              {typingDone && (
                <div className="flex flex-wrap justify-end gap-2">
                  <button type="button" onClick={listen} disabled={speaking} className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-neon/35 bg-neon/10 px-4 text-sm font-bold text-neon disabled:opacity-60">
                    <Volume2 className={`size-4 ${speaking ? "animate-pulse" : ""}`} aria-hidden="true" />{speaking ? content.listening : content.listen}
                  </button>
                  <button type="button" onClick={advance} className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-neon px-4 text-sm font-black text-primary-foreground">
                    {lastLine ? content.start : content.next}<ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypewriterText({ text, onDone }: { text: string; onDone: () => void }) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    let character = 0;
    const timer = window.setInterval(() => {
      character += 1;
      setVisibleCharacters(character);
      if (character >= text.length) {
        window.clearInterval(timer);
        onDone();
      }
    }, 28);
    return () => window.clearInterval(timer);
  }, [onDone, text]);

  const done = visibleCharacters >= text.length;
  return (
    <p aria-hidden="true" className="mt-5 min-h-20 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
      {text.slice(0, visibleCharacters)}
      {!done && <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-neon align-middle" />}
    </p>
  );
}

function ActionButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-5 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{disabled ? <Loader2 className="size-4 animate-spin" /> : null}{children}<ChevronRight className="size-4" /></button>;
}

function ScoreFeedback({ score }: { score: number }) {
  return <p className={`mt-5 rounded-xl border px-4 py-3 text-sm font-semibold ${score >= 80 ? "border-success/30 bg-success/10 text-success" : "border-gold/30 bg-gold/10 text-gold"}`}>{score}%</p>;
}

function TheoryStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["theory"] | (typeof operatorCallContent)["ro"]["theory"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div><p className="text-base leading-relaxed text-foreground/90 sm:text-lg">{content.lead}</p><div className="mt-6 grid gap-4 sm:grid-cols-2">{content.cards.map((card, index) => <article key={card.title} className="rounded-3xl border border-border bg-background/40 p-5 sm:p-6 shadow-[0_5px_20px_rgba(0,0,0,0.1)] transition hover:border-neon/40 hover:bg-background/60"><span className="text-sm font-black tracking-widest text-neon/60">0{index + 1}</span><h3 className="mt-3 text-lg sm:text-xl font-black text-foreground">{card.title}</h3><p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">{card.text}</p></article>)}</div><p className="mt-8 rounded-3xl border border-neon/40 bg-neon/10 p-6 sm:p-8 text-lg sm:text-xl font-bold text-neon shadow-[0_0_30px_rgba(0,217,255,0.1)]">{content.rule}</p><ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton></div>;
}

function VideoExplanationStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExplanation"] | (typeof operatorCallContent)["ro"]["videoExplanation"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div><VideoPlaceholder title={content.title} placeholder={content.placeholder} hint={content.hint} /><ul className="mt-5 grid gap-3 sm:grid-cols-2">{content.points.map((point) => <li key={point} className="flex gap-3 rounded-xl border border-border bg-background/35 p-4 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-neon" />{point}</li>)}</ul><ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton></div>;
}

function VideoExampleStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExample"] | (typeof operatorCallContent)["ro"]["videoExample"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div><VideoPlaceholder title={content.title} placeholder={content.placeholder} hint={content.hint} /><div className="mt-5 space-y-3">{content.transcript.map((line, index) => <div key={`${line.speaker}-${index}`} className={`max-w-[88%] rounded-2xl border p-4 ${index % 2 === 0 ? "border-danger/25 bg-danger/5" : "ml-auto border-neon/25 bg-neon/5"}`}><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{line.speaker}</p><p className="mt-1 text-sm">{line.text}</p></div>)}</div><ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton></div>;
}

function VideoPlaceholder({ title, placeholder, hint }: { title: string; placeholder: string; hint: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neon/25 bg-slate-950">
      <video 
        className="aspect-video w-full bg-black object-cover" 
        controls 
        preload="metadata"
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
        <p>Your browser doesn't support HTML5 video.</p>
      </video>
      <div className="border-t border-border bg-card p-4">
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{placeholder} — {hint}</p>
      </div>
    </div>
  );
}

function CallSimulatorStage({ locale, content, check, saving, feedback, onSubmit }: { locale: OperatorLocale; content: (typeof operatorCallContent)["ru"]["callSimulator"] | (typeof operatorCallContent)["ro"]["callSimulator"]; check: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "playing" | "failed" | "won">("idle");
  const [failReason, setFailReason] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(100);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const level = content.levels[currentLevelIndex];
  const phrase = level?.phrases[currentPhraseIndex];

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          setStatus("failed");
          setFailReason(content.timeout);
          return 0;
        }
        return prev - 1; 
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [status, content.timeout, currentPhraseIndex]);

  useEffect(() => {
    if (status !== "playing" || !phrase) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }
    
    const levelNum = currentLevelIndex + 1;
    const phraseNum = currentPhraseIndex + 1;
    const audioSrc = levelNum === 1 
      ? `/audio/${levelNum}/${locale}.mp3` 
      : `/audio/${levelNum}/${locale}${phraseNum}.mp3`;
      
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.play().catch(e => console.error("Audio play failed:", e));
    
    return () => {
      audio.pause();
    };
  }, [status, currentLevelIndex, currentPhraseIndex, locale, phrase]);

  function handleAction(isDangerAction: boolean) {
    if (status !== "playing" || !phrase) return;
    if (phrase.isThreat) {
      if (isDangerAction) advanceLevel();
      else { setStatus("failed"); setFailReason(content.loseThreat); }
    } else {
      if (isDangerAction) { setStatus("failed"); setFailReason(content.loseSafe); }
      else {
        if (currentPhraseIndex < level.phrases.length - 1) {
          setCurrentPhraseIndex((prev) => prev + 1);
          setTimeLeft(100);
        } else advanceLevel();
      }
    }
  }

  function advanceLevel() {
    if (currentLevelIndex < content.levels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setCurrentPhraseIndex(0);
      setTimeLeft(100);
    } else {
      setStatus("won");
    }
  }

  function start() {
    setCurrentLevelIndex(0);
    setCurrentPhraseIndex(0);
    setTimeLeft(100);
    setStatus("playing");
    setFailReason(null);
  }

  return (
    <div>
      <p className="font-semibold text-foreground/90 sm:text-lg">{content.prompt}</p>
      
      <div className="mt-6 overflow-hidden rounded-3xl border border-neon/30 bg-slate-950 shadow-2xl relative">
        <div className="absolute top-0 w-full h-1.5 bg-secondary/50">
           <div className={`h-full ${timeLeft < 30 ? 'bg-danger' : 'bg-neon'} transition-all duration-75`} style={{ width: `${timeLeft}%` }} />
        </div>
        
        <div className="p-6 sm:p-8 text-center min-h-[340px] flex flex-col justify-center items-center relative">
          {status === "idle" && (
            <div className="animate-in fade-in">
              <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-neon/10 border border-neon/40 text-neon animate-pulse">
                <Volume2 className="size-10" />
              </div>
              <button onClick={start} className="mt-8 rounded-xl bg-neon px-8 py-3 text-sm font-black text-primary-foreground focus-ring hover:scale-105 transition">{content.startBtn}</button>
            </div>
          )}
          
          {status === "playing" && phrase && (
            <div className="w-full max-w-lg animate-in fade-in zoom-in-95">
              <div className="mb-6 text-xs font-black text-neon/60 uppercase tracking-widest">
                {content.levelText} {currentLevelIndex + 1} / {content.levels.length}
              </div>
              <div className="flex flex-col items-center gap-5">
                <div className="relative size-20 rounded-full bg-slate-800 flex items-center justify-center border border-border shadow-[0_0_25px_rgba(0,0,0,0.5)]">
                   <div className="absolute inset-0 rounded-full border border-neon/20 animate-ping opacity-50"></div>
                   <Volume2 className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold leading-relaxed text-foreground min-h-[96px] flex items-center justify-center px-4">
                  «{phrase.text}»
                </h3>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                <button 
                  onClick={() => handleAction(false)}
                  className="flex min-h-16 items-center justify-center rounded-2xl border-2 border-success/40 bg-success/10 px-2 text-center text-sm font-black text-success transition hover:bg-success/20 hover:border-success/60 focus-ring"
                >
                  {content.safeBtn}
                </button>
                <button 
                  onClick={() => handleAction(true)}
                  className="flex min-h-16 items-center justify-center rounded-2xl border-2 border-danger/40 bg-danger/10 px-2 text-center text-sm font-black text-danger transition hover:bg-danger/20 hover:border-danger/60 focus-ring"
                >
                  {content.dangerBtn}
                </button>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="w-full max-w-sm animate-in fade-in zoom-in">
               <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-danger/10 text-danger border border-danger/30 mb-5">
                 <ShieldAlert className="size-10" />
               </div>
               <p className="text-lg font-bold text-danger">{failReason}</p>
               <button onClick={start} className="mt-8 rounded-xl border-2 border-danger/40 bg-danger/10 px-8 py-3 text-sm font-black text-danger focus-ring hover:bg-danger/20 transition">
                 {content.retryBtn}
               </button>
            </div>
          )}

          {status === "won" && (
            <div className="w-full max-w-sm animate-in fade-in zoom-in">
               <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success/10 text-success border border-success/30 mb-5">
                 <CheckCircle2 className="size-10" />
               </div>
               <p className="text-xl font-bold text-success">{content.win}</p>
            </div>
          )}
        </div>
      </div>
      
      {status === "won" && (
        <div className="mt-6 flex justify-end animate-in fade-in slide-in-from-bottom-4">
          <ActionButton disabled={saving} onClick={onSubmit}>{check}</ActionButton>
        </div>
      )}
    </div>
  );
}

function ClassifyStage({ content, answers, setAnswers, check, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["classify"] | (typeof operatorCallContent)["ro"]["classify"]; answers: Record<string, "safe" | "danger">; setAnswers: React.Dispatch<React.SetStateAction<Record<string, "safe" | "danger">>>; check: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount >= content.items.length;
  
  const currentItem = content.items[answeredCount];

  const handleSwipe = (direction: "left" | "right") => {
    if (!currentItem) return;
    const answer = direction === "left" ? "danger" : "safe";
    setAnswers(prev => ({ ...prev, [currentItem.id]: answer }));
  };

  return (
    <div className="flex flex-col items-center w-full overflow-hidden pb-10">
      <p className="font-bold text-center text-lg sm:text-xl text-foreground/90 mb-8">{content.prompt}</p>
      
      {!isComplete ? (
        <div className="relative w-full max-w-sm aspect-[4/5] sm:aspect-square flex items-center justify-center">
          <AnimatePresence mode="popLayout">
             {currentItem && (
               <SwipeCard 
                  key={currentItem.id} 
                  item={currentItem} 
                  onSwipe={handleSwipe}
                  safeText={content.safe}
                  dangerText={content.danger}
               />
             )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-neon/40 rounded-3xl bg-neon/10 shadow-[0_0_40px_rgba(0,217,255,0.15)]">
           <CheckCircle2 className="size-16 text-neon mb-4" />
           <p className="text-2xl font-black mb-8 text-foreground">{content.completeMessage}</p>
           {feedback && <ScoreFeedback score={feedback.score} />}
           <ActionButton disabled={saving} onClick={onSubmit}>{check}</ActionButton>
        </div>
      )}
      
      {!isComplete && (
         <div className="flex justify-between w-full max-w-sm mt-8 px-4">
            <button onClick={() => handleSwipe("left")} className="flex flex-col items-center gap-2 text-danger hover:scale-110 transition">
              <div className="size-16 rounded-full border-2 border-danger flex items-center justify-center bg-danger/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                 <ShieldAlert className="size-8" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider">{content.danger}</span>
            </button>
            <button onClick={() => handleSwipe("right")} className="flex flex-col items-center gap-2 text-success hover:scale-110 transition">
              <div className="size-16 rounded-full border-2 border-success flex items-center justify-center bg-success/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                 <Check className="size-8" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider">{content.safe}</span>
            </button>
         </div>
      )}
    </div>
  );
}

function SwipeCard({ item, onSwipe, safeText, dangerText }: { item: any, onSwipe: (dir: "left" | "right") => void, safeText: string, dangerText: string }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const dangerOpacity = useTransform(x, [0, -100], [0, 1]);
  const safeOpacity = useTransform(x, [0, 100], [0, 1]);

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragSnapToOrigin={true}
      onDragEnd={(e, { offset, velocity }) => {
        const swipeThreshold = 80;
        if (offset.x > swipeThreshold || velocity.x > 400) {
          onSwipe("right");
        } else if (offset.x < -swipeThreshold || velocity.x < -400) {
          onSwipe("left");
        }
      }}
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="absolute w-full h-full border border-border rounded-3xl bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 sm:p-8 flex flex-col items-center justify-center text-center select-none cursor-grab active:cursor-grabbing overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 pointer-events-none" />
      <p className="text-xl sm:text-3xl font-black leading-tight z-10 text-foreground">{item.text}</p>
      
      <motion.div style={{ opacity: dangerOpacity }} className="absolute inset-0 bg-danger/10 pointer-events-none flex items-center justify-center">
         <div className="absolute top-6 right-6 border-4 border-danger bg-background/50 backdrop-blur-sm text-danger font-black text-xl uppercase px-3 py-1 rounded-xl transform rotate-12 shadow-lg">
           {dangerText}
         </div>
      </motion.div>
      
      <motion.div style={{ opacity: safeOpacity }} className="absolute inset-0 bg-success/10 pointer-events-none flex items-center justify-center">
         <div className="absolute top-6 left-6 border-4 border-success bg-background/50 backdrop-blur-sm text-success font-black text-xl uppercase px-3 py-1 rounded-xl transform -rotate-12 shadow-lg">
           {safeText}
         </div>
      </motion.div>
    </motion.div>
  );
}

function DialogueStage({ content, check, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["dialogue"] | (typeof operatorCallContent)["ro"]["dialogue"]; check: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [errorText, setErrorText] = useState<string | null>(null);

  const level = content.levels?.[currentLevelIndex];
  
  if (!level) {
    return (
      <div className="flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-neon/40 rounded-3xl bg-neon/10 shadow-[0_0_40px_rgba(0,217,255,0.15)]">
         <CheckCircle2 className="size-16 text-neon mb-4" />
         <p className="text-2xl font-black mb-8 text-foreground">{content.win}</p>
         {feedback && <ScoreFeedback score={feedback.score} />}
         <ActionButton disabled={saving} onClick={onSubmit}>{check}</ActionButton>
      </div>
    );
  }

  const togglePart = (id: string) => {
    setErrorText(null);
    setSelectedParts(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const verify = () => {
    let correct = true;
    let selectedLies = 0;
    
    level.parts.forEach(part => {
      const isSelected = selectedParts.has(part.id);
      if (part.isLie && isSelected) {
        selectedLies++;
      }
      if (!part.isLie && isSelected) {
        correct = false;
      }
    });

    if (correct && selectedLies === level.liesCount) {
      setCurrentLevelIndex(prev => prev + 1);
      setSelectedParts(new Set());
      setErrorText(null);
    } else {
      setErrorText(content.error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto pb-10">
      <p className="font-bold text-center text-lg sm:text-xl text-foreground/90 mb-6">{content.prompt}</p>
      
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <span className="text-xs font-black tracking-widest text-neon/60 uppercase">
          {content.levelText} {currentLevelIndex + 1} / {content.levels.length}
        </span>
        <span className="text-xs font-black text-muted-foreground">
          {selectedParts.size} / {level.liesCount}
        </span>
      </div>

      <div className="relative w-full bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] mb-8 text-left leading-relaxed text-lg sm:text-xl">
        <div className="absolute -bottom-3 left-8 w-6 h-6 bg-slate-900 border-b border-l border-border transform -rotate-45" />
        
        {level.parts.map(part => {
          const isSelected = selectedParts.has(part.id);
          const selectedStyle = "bg-danger/30 text-danger-foreground border-b-2 border-danger";
          const hoverStyle = "hover:bg-foreground/10";
          const baseStyle = "transition-colors duration-200 cursor-pointer rounded px-1 -mx-1 select-none";
          
          return (
             <span 
               key={part.id} 
               onClick={() => togglePart(part.id)}
               className={`${baseStyle} ${isSelected ? selectedStyle : hoverStyle}`}
             >
               {part.text}
             </span>
          );
        })}
      </div>

      <div className="h-8 mb-6">
        {errorText && (
          <p className="text-danger font-bold animate-in slide-in-from-top-2 text-center">{errorText}</p>
        )}
      </div>

      <button 
        onClick={verify}
        className="rounded-xl bg-neon px-12 py-4 text-sm font-black text-primary-foreground focus-ring hover:scale-105 transition shadow-[0_0_20px_rgba(0,217,255,0.4)]"
      >
        {content.verifyBtn}
      </button>
    </div>
  );
}

function OrderingStage({ content, ordered, setOrdered, check, retry, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["ordering"] | (typeof operatorCallContent)["ro"]["ordering"]; ordered: string[]; setOrdered: React.Dispatch<React.SetStateAction<string[]>>; check: string; retry: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  const shuffled = [content.actions[2], content.actions[0], content.actions[3], content.actions[1]];
  return <div><p className="font-semibold">{content.prompt}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{shuffled.map((action) => { const position = ordered.indexOf(action.id); return <button key={action.id} type="button" disabled={position >= 0} onClick={() => setOrdered((previous) => [...previous, action.id])} className="focus-ring flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-background/35 p-4 text-left text-sm disabled:opacity-40"><span className="grid size-7 shrink-0 place-items-center rounded-full border border-neon/40 text-xs font-bold text-neon">{position >= 0 ? position + 1 : "?"}</span>{action.label}</button>; })}</div>{ordered.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{ordered.map((id, index) => <span key={id} className="rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-xs text-neon">{index + 1}. {content.actions.find((action) => action.id === id)?.label}</span>)}</div>}{feedback && <ScoreFeedback score={feedback.score} />}<div className="flex flex-wrap gap-3"><ActionButton disabled={saving || ordered.length !== content.actions.length} onClick={onSubmit}>{check}</ActionButton><button type="button" onClick={() => setOrdered([])} className="focus-ring mt-6 min-h-12 rounded-xl border border-border px-5 text-sm font-bold text-muted-foreground">{retry}</button></div></div>;
}

function FinalStage({ content, answers, setAnswers, check, retry, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["final"] | (typeof operatorCallContent)["ro"]["final"]; answers: Record<string, number>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>; check: string; retry: string; saving: boolean; feedback: { score: number; passed?: boolean } | null; onSubmit: () => void }) {
  return <div><div className="rounded-2xl border border-gold/35 bg-gold/10 p-5"><ShieldAlert className="size-7 text-gold" /><p className="mt-3 font-semibold leading-relaxed">{content.intro}</p></div><div className="mt-5 space-y-4">{content.questions.map((question, questionIndex) => <fieldset key={question.id} className="rounded-2xl border border-border bg-background/35 p-5"><legend className="px-2 text-sm font-bold">{questionIndex + 1}. {question.text}</legend><div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => <label key={option} className={`focus-within:ring-2 focus-within:ring-neon/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${answers[question.id] === optionIndex ? "border-neon/50 bg-neon/10" : "border-border"}`}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }))} className="accent-cyan-400" />{option}</label>)}</div></fieldset>)}</div>{feedback && <div className={`mt-5 rounded-2xl border p-5 ${feedback.passed ? "border-success/35 bg-success/10 text-success" : "border-danger/35 bg-danger/10 text-danger"}`}><p className="font-display text-2xl font-black">{feedback.score}%</p><p className="mt-2 text-sm">{feedback.passed ? content.win : content.lose}</p></div>}<div className="flex flex-wrap gap-3"><ActionButton disabled={saving || Object.keys(answers).length !== content.questions.length} onClick={onSubmit}>{check}</ActionButton>{feedback && !feedback.passed && <button type="button" onClick={() => setAnswers({})} className="focus-ring mt-6 min-h-12 rounded-xl border border-border px-5 text-sm font-bold text-muted-foreground">{retry}</button>}</div></div>;
}
