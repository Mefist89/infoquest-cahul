"use client";

import Image from "next/image";
import Link from "next/link";

const playSound = (type: "correct" | "wrong" | "timeout") => {
  if (typeof window !== "undefined") {
    const audio = new Audio(`/audio/${type}.mp3`);
    audio.play().catch(() => {});
  }
};
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
  User,
  Phone,
  MessageCircle,
  XCircle,
  Skull,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

const NextButtonContext = createContext<React.ReactNode>(null);

import { operatorCallContent, type OperatorLocale } from "@/data/operator-call";
import { createClient } from "@/lib/supabase/client";

type StageProgress = { stage_index: number; status: "not_started" | "in_progress" | "completed"; score: number };
type ModuleProgress = { status: "not_started" | "in_progress" | "completed"; xp: number; score: number } | null;

const stageIcons: LucideIcon[] = [BookOpen, Clapperboard, Video, ScanSearch, ListChecks, MessageSquare, ListOrdered, ShieldAlert];

export function OperatorCallModule({ locale, initialStages, initialModule, isAdmin }: { locale: OperatorLocale; initialStages: StageProgress[]; initialModule: ModuleProgress; isAdmin?: boolean }) {
  const t = operatorCallContent[locale];
  const initialCompleted = initialStages.filter((stage) => stage.status === "completed").map((stage) => stage.stage_index);
  const firstOpenStage = Array.from({ length: 8 }, (_, index) => index + 1).find((stage) => !initialCompleted.includes(stage)) ?? 8;
  const [completedStages, setCompletedStages] = useState(() => new Set(initialCompleted));
  const [currentStage, setCurrentStage] = useState(initialCompleted.length === 0 ? 0 : firstOpenStage);
  const [moduleXp, setModuleXp] = useState(initialModule?.xp ?? 0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [classification, setClassification] = useState<Record<string, "safe" | "danger">>({});
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
    setFeedback({ stage: 7, score: 100 });
    await completeStage(7, 100);
  }

  async function submitFinal() {
    setFeedback({ stage: 8, score: 100 });
    await completeStage(8, 100);
  }

  return (
    <main className="circuit-bg min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center gap-3">
          <Link href={`/${locale}`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-neon transition hover:border-neon/60">
            <ArrowLeft className="size-4" aria-hidden="true" /> {t.back}
          </Link>
          <Link href={`/${locale}/profile`} className="focus-ring ml-auto inline-flex min-h-11 items-center rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-muted-foreground transition hover:border-neon/60 hover:text-foreground">{t.profile}</Link>
          {isAdmin && (
            <Link href={`/${locale}/admin`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-3 text-xs font-bold text-neon transition hover:border-neon hover:bg-neon/20">
              <ShieldCheck className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{locale === "ro" ? "Administrare" : "Админ"}</span>
            </Link>
          )}
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
                const locked = number > unlockedThrough;
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
            <NextButtonContext.Provider value={
              currentStage < 8 ? (
                <button type="button" disabled={!completedStages.has(currentStage)} onClick={() => chooseStage(currentStage + 1)} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-5 text-sm font-black text-neon transition hover:border-neon hover:bg-neon/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-neon/40 disabled:hover:bg-neon/10">
                  {t.next}<ChevronRight className="size-4" aria-hidden="true" />
                </button>
              ) : null
            }>
              <div className="mt-7">
                {currentStage === 0 && <IntroStage content={t.intro} locale={locale} onFinish={() => setCurrentStage(firstOpenStage)} />}
                {currentStage === 1 && <TheoryStage content={t.theory} button={t.continue} saving={saving} onComplete={() => completeStage(1)} />}
                {currentStage === 2 && <VideoExplanationStage content={t.videoExplanation} button={t.continue} saving={saving} onComplete={() => completeStage(2)} />}
                {currentStage === 3 && <VideoExampleStage content={t.videoExample} button={t.continue} saving={saving} onComplete={() => completeStage(3)} />}
                {currentStage === 4 && <CallSimulatorStage locale={locale} content={t.callSimulator} check={t.continue} saving={saving} feedback={feedback?.stage === 4 ? feedback : null} onSubmit={submitCallSimulator} />}
                {currentStage === 5 && <ClassifyStage content={t.classify} answers={classification} setAnswers={setClassification} check={t.check} saving={saving} feedback={feedback?.stage === 5 ? feedback : null} onSubmit={submitClassification} />}
                {currentStage === 6 && <DialogueStage content={t.dialogue} check={t.continue} saving={saving} feedback={feedback?.stage === 6 ? feedback : null} onSubmit={submitDialogue} />}
                {currentStage === 7 && <OrderingStage content={t.ordering} check={t.check} retry={t.retry} saving={saving} feedback={feedback?.stage === 7 ? feedback : null} onSubmit={submitOrdering} />}
                {currentStage === 8 && <FinalStage content={t.final} check={t.check} retry={t.retry} saving={saving} feedback={feedback?.stage === 8 ? feedback : null} onSubmit={submitFinal} />}
              </div>
            </NextButtonContext.Provider>

            {notice && <p className={`mt-6 rounded-xl border px-4 py-3 text-sm ${notice.kind === "success" ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"}`}>{notice.text}</p>}
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

function ActionButton({ children, disabled, onClick, center }: { children: React.ReactNode; disabled?: boolean; onClick: () => void; center?: boolean }) {
  const nextBtn = useContext(NextButtonContext);
  return (
    <div className={`mt-6 flex w-full flex-wrap items-center gap-4 ${center ? "justify-center" : "justify-between"}`}>
      <button type="button" disabled={disabled} onClick={onClick} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-5 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
        {disabled ? <Loader2 className="size-4 animate-spin" /> : null}{children}<ChevronRight className="size-4" />
      </button>
      {nextBtn}
    </div>
  );
}

function ScoreFeedback({ score }: { score: number }) {
  return <p className={`mt-5 rounded-xl border px-4 py-3 text-sm font-semibold ${score >= 80 ? "border-success/30 bg-success/10 text-success" : "border-gold/30 bg-gold/10 text-gold"}`}>{score}%</p>;
}

function TheoryStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["theory"] | (typeof operatorCallContent)["ro"]["theory"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div>
    <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">{content.lead}</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{content.cards.map((card, index) => <article key={card.title} className="rounded-3xl border border-border bg-background/40 p-5 sm:p-6 shadow-[0_5px_20px_rgba(0,0,0,0.1)] transition hover:border-neon/40 hover:bg-background/60"><span className="text-sm font-black tracking-widest text-neon/60">0{index + 1}</span><h3 className="mt-3 text-lg sm:text-xl font-black text-foreground">{card.title}</h3><p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">{card.text}</p></article>)}</div>
    <p className="mt-8 rounded-3xl border border-neon/40 bg-neon/10 p-6 sm:p-8 text-lg sm:text-xl font-bold text-neon shadow-[0_0_30px_rgba(0,217,255,0.1)]">{content.rule}</p>
    
    {'bookletText' in content && 'bookletFile' in content && content.bookletText && content.bookletFile && (
      <div className="mt-8 flex justify-center sm:justify-start">
        <a href={content.bookletFile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 transition-colors hover:border-neon hover:bg-slate-800 text-foreground group focus-ring">
          <BookOpen className="text-neon size-6 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm sm:text-base">{content.bookletText}</span>
        </a>
      </div>
    )}

    <ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton>
  </div>;
}

function VideoExplanationStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExplanation"] | (typeof operatorCallContent)["ro"]["videoExplanation"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div><VideoPlaceholder title={content.title} placeholder={content.placeholder} hint={content.hint} src={content.videoUrl} /><ul className="mt-5 grid gap-3 sm:grid-cols-2">{content.points.map((point) => <li key={point} className="flex gap-3 rounded-xl border border-border bg-background/35 p-4 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-neon" />{point}</li>)}</ul><ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton></div>;
}

function VideoExampleStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExample"] | (typeof operatorCallContent)["ro"]["videoExample"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div><VideoPlaceholder title={content.title} placeholder={content.placeholder} hint={content.hint} src="/video/3video.mp4" /><div className="mt-5 space-y-3">{content.transcript.map((line, index) => <div key={`${line.speaker}-${index}`} className={`max-w-[88%] rounded-2xl border p-4 ${index % 2 === 0 ? "border-danger/25 bg-danger/5" : "ml-auto border-neon/25 bg-neon/5"}`}><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{line.speaker}</p><p className="mt-1 text-sm">{line.text}</p></div>)}</div><ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton></div>;
}

function VideoPlaceholder({ title, placeholder, hint, src }: { title: string; placeholder: string; hint: string; src?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neon/25 bg-slate-950">
      <video 
        className="aspect-video w-full bg-black object-cover" 
        controls 
        preload="metadata"
      >
        <source src={src || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} type="video/mp4" />
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
      if (isDangerAction) { playSound("correct"); advanceLevel(); }
      else { playSound("wrong"); setStatus("failed"); setFailReason(content.loseThreat); }
    } else {
      if (isDangerAction) { playSound("wrong"); setStatus("failed"); setFailReason(content.loseSafe); }
      else {
        if (currentPhraseIndex < level.phrases.length - 1) {
          setCurrentPhraseIndex((prev) => prev + 1);
          setTimeLeft(100);
        } else { playSound("correct"); advanceLevel(); }
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
      
      <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-4">
        <ActionButton disabled={saving || status !== "won"} onClick={onSubmit}>{check}</ActionButton>
      </div>
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
    if (answer === (currentItem as any).answer) playSound("correct");
    else playSound("wrong");
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
      <div className="mt-6 w-full">
         <ActionButton disabled={saving || !isComplete} onClick={onSubmit}>{check}</ActionButton>
      </div>
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
      playSound("correct");
      setCurrentLevelIndex(prev => prev + 1);
      setSelectedParts(new Set());
      setErrorText(null);
    } else {
      playSound("wrong");
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
      <div className="mt-6 w-full">
        <ActionButton disabled={true} onClick={() => {}}>{check}</ActionButton>
      </div>
    </div>
  );
}

function OrderingStage({ content, check, retry, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["ordering"] | (typeof operatorCallContent)["ro"]["ordering"]; check: string; retry: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [status, setStatus] = useState<"playing" | "failed" | "won">("playing");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [shuffledSteps, setShuffledSteps] = useState<{id: string, text: string}[]>([]);
  const [flashError, setFlashError] = useState(false);
  
  const level = content.levels?.[currentLevelIndex];

  useEffect(() => {
    if (level && status === "playing") {
      setTimeLeft(level.time);
      setOrderedIds([]);
      setShuffledSteps([...level.steps].sort(() => Math.random() - 0.5));
    }
  }, [currentLevelIndex, level, status]);

  useEffect(() => {
    if (status !== "playing" || !level) return;
    
    if (timeLeft <= 0) {
      setStatus("failed");
      return;
    }
    
    const timer = window.setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => window.clearInterval(timer);
  }, [status, timeLeft, level]);

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

  const handleStepClick = (stepId: string) => {
    if (status !== "playing") return;
    if (orderedIds.includes(stepId)) return;

    const expectedNextId = level.steps[orderedIds.length].id;
    
    if (stepId === expectedNextId) {
      playSound("correct");
      const newOrderedIds = [...orderedIds, stepId];
      setOrderedIds(newOrderedIds);
      
      if (newOrderedIds.length === level.steps.length) {
        if (currentLevelIndex === content.levels.length - 1) {
          setCurrentLevelIndex(prev => prev + 1); 
        } else {
          setCurrentLevelIndex(prev => prev + 1);
        }
      }
    } else {
      playSound("wrong");
      setTimeLeft(prev => Math.max(0, prev - 3));
      setFlashError(true);
      setTimeout(() => setFlashError(false), 300);
    }
  };

  const restartLevel = () => {
    setStatus("playing");
    setTimeLeft(level.time);
    setOrderedIds([]);
    setShuffledSteps([...level.steps].sort(() => Math.random() - 0.5));
  };

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-danger/40 rounded-3xl bg-danger/10">
         <XCircle className="size-16 text-danger mb-4" />
         <p className="text-2xl font-black mb-8 text-foreground">{content.fail}</p>
         <button onClick={restartLevel} className="rounded-xl bg-danger px-12 py-4 text-sm font-black text-danger-foreground focus-ring hover:scale-105 transition">{retry}</button>
      </div>
    );
  }

  const isLowTime = timeLeft <= 5;
  const isErrorState = isLowTime || flashError;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto pb-10">
      <p className="font-bold text-center text-lg sm:text-xl text-foreground/90 mb-6">{content.prompt}</p>
      
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <span className="text-xs font-black tracking-widest text-neon/60 uppercase">
          {content.levelText} {currentLevelIndex + 1} / {content.levels.length}
        </span>
        <span className={`text-2xl font-black tabular-nums transition-colors duration-200 ${isErrorState ? 'text-danger animate-pulse scale-110' : 'text-neon'}`}>
          0:{timeLeft.toString().padStart(2, '0')}
        </span>
      </div>

      <div className={`w-full rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 ${isErrorState ? 'border-danger bg-danger/5 shadow-[0_0_50px_rgba(255,0,0,0.3)]' : 'border-border bg-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.3)]'}`}>
        
        <div className="flex flex-col gap-3">
          {shuffledSteps.map((step) => {
            const isSelected = orderedIds.includes(step.id);
            const indexNumber = isSelected ? orderedIds.indexOf(step.id) + 1 : null;
            
            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={isSelected}
                className={`relative flex items-center p-4 rounded-2xl border-2 text-left transition-all duration-300
                  ${isSelected 
                    ? 'border-neon/50 bg-neon/10 text-foreground/80 scale-[0.98] opacity-60' 
                    : 'border-border bg-background/50 hover:bg-background/80 hover:border-neon/30 active:scale-[0.99]'
                  }
                `}
              >
                {isSelected && (
                   <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-neon text-background font-black flex items-center justify-center shadow-lg border-2 border-background z-10">
                     {indexNumber}
                   </div>
                )}
                <span className="text-sm sm:text-base font-medium">{step.text}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="mt-6 w-full">
        <ActionButton disabled={true} onClick={() => {}}>{check}</ActionButton>
      </div>
    </div>
  );
}

function FinalStage({ content, check, retry, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["final"] | (typeof operatorCallContent)["ro"]["final"]; check: string; retry: string; saving: boolean; feedback: { score: number; passed?: boolean } | null; onSubmit: () => void }) {
  const MAX_PLAYER_HP = 3;
  const MAX_BOSS_HP = 10;
  
  const [playerHp, setPlayerHp] = useState(MAX_PLAYER_HP);
  const [bossHp, setBossHp] = useState(MAX_BOSS_HP);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [foundDetails, setFoundDetails] = useState<Set<string>>(new Set());
  const [bossSelected, setBossSelected] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<"playing" | "gameover" | "win">("playing");
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(12);
  const [shake, setShake] = useState(false);

  const takeDamage = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setPlayerHp(prev => {
      const next = prev - 1;
      if (next <= 0) setStatus("gameover");
      return next;
    });
  };

  const advanceLevel = () => {
    setFoundDetails(new Set());
    setBossSelected(new Set());
    setBossSelected(new Set());
    if (currentLevel < 9) {
      setCurrentLevel(prev => prev + 1);
    } else {
      if (currentPhase < 2) {
        setCurrentPhase(prev => prev + 1);
        setCurrentLevel(0);
      } else {
        setStatus("win");
      }
    }
    setBlitzTimeLeft(12); 
  };

  useEffect(() => {
    if (status !== "playing" || currentPhase !== 1) return;
    
    if (blitzTimeLeft <= 0) {
      playSound("timeout");
      takeDamage();
      advanceLevel();
      return;
    }
    
    const timer = window.setInterval(() => {
      setBlitzTimeLeft(prev => prev - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status, currentPhase, blitzTimeLeft]);

  const handleVisualClick = (targetId: string, isCorrect: boolean) => {
    if (isCorrect) {
      playSound("correct");
      setFoundDetails(prev => {
        const next = new Set(prev);
        next.add(targetId);
        
        const required = (content.phase1[currentLevel] as any).correctTargets?.length || 1;
        if (next.size >= required) {
          setTimeout(() => advanceLevel(), 300);
          return new Set();
        }
        return next;
      });
    } else {
      playSound("wrong");
      takeDamage();
    }
  };

const handleBlitzClick = (optionIndex: number) => {
    const isCorrect = optionIndex === content.phase2[currentLevel].answer;
    if (isCorrect) {
      playSound("correct");
      advanceLevel();
    } else {
      playSound("wrong");
      takeDamage();
      advanceLevel();
    }
  };

  const handleBossClick = (optionIndex: number) => {
    const answers = (content.phase3[currentLevel] as any).answers;
    const isCorrect = answers.includes(optionIndex);
    
    if (isCorrect) {
      playSound("correct");
      setBossSelected(prev => {
        const next = new Set(prev);
        next.add(optionIndex);
        
        if (next.size >= answers.length) {
          setBossHp(hp => {
            const nextHp = hp - 1;
            setTimeout(() => {
              if (nextHp <= 0) {
                setStatus("win");
              } else {
                advanceLevel();
              }
            }, 300);
            return nextHp;
          });
          return new Set();
        }
        return next;
      });
    } else {
      playSound("wrong");
      takeDamage();
      setBossSelected(new Set());
    }
  };

const restart = () => {
    setPlayerHp(MAX_PLAYER_HP);
    setBossHp(MAX_BOSS_HP);
    setCurrentPhase(0);
    setCurrentLevel(0);
    setStatus("playing");
    setBlitzTimeLeft(12);
    setFoundDetails(new Set());
  };

  if (status === "gameover") {
    return (
      <div className="flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-danger/40 rounded-3xl bg-danger/10">
         <XCircle className="size-16 text-danger mb-4" />
         <p className="text-2xl font-black mb-8 text-foreground">{content.gameOver}</p>
         <button onClick={restart} className="rounded-xl bg-danger px-12 py-4 text-sm font-black text-danger-foreground focus-ring hover:scale-105 transition">{retry}</button>
      </div>
    );
  }

  if (status === "win") {
    return (
      <div className="flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-neon/40 rounded-3xl bg-neon/10 shadow-[0_0_40px_rgba(0,217,255,0.15)]">
         <CheckCircle2 className="size-16 text-neon mb-4" />
         <p className="text-2xl font-black mb-8 text-foreground">{content.win}</p>
         <ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton>
      </div>
    );
  }

  const renderHP = (hp: number, max: number, colorClass: string) => (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`h-3 w-[35px] sm:w-[53px] rounded-full border-2 transition-all duration-300 ${i < hp ? colorClass + ' border-transparent' : 'bg-transparent border-foreground/20'}`} />
      ))}
    </div>
  );

  return (
    <div className={`flex flex-col items-center w-full max-w-2xl mx-auto pb-10 transition-transform ${shake ? 'animate-shake' : ''}`}>
      <div className="w-full flex justify-between items-center mb-8 px-4 bg-slate-900/50 p-4 rounded-2xl border border-border">
        <div>
          <p className="text-xs font-black tracking-widest text-muted-foreground uppercase mb-1">HP</p>
          {renderHP(playerHp, MAX_PLAYER_HP, "bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]")}
        </div>
        {currentPhase === 2 && (
          <div className="text-right">
            <p className="text-xs font-black tracking-widest text-muted-foreground uppercase mb-1">Boss HP</p>
            {renderHP(bossHp, MAX_BOSS_HP, "bg-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]")}
          </div>
        )}
      </div>

      {currentPhase === 0 && (
        <div className="w-full flex flex-col items-center animate-in fade-in">
          <p className="font-bold text-center text-lg text-neon mb-6">{content.phase1Intro}</p>
          <div className="w-full max-w-sm bg-slate-100 dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
            <div className="bg-slate-200 dark:bg-slate-950 px-6 py-2 flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-300 dark:border-slate-800">
              <span>09:41</span>
              <div className="flex gap-1"><span className="w-4 h-2 bg-slate-400 rounded-sm"></span></div>
            </div>
            
            <div className="bg-slate-800/10 py-1 text-center border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Улики: {foundDetails.size} / {(content.phase1[currentLevel] as any).correctTargets?.length || 1}</span>
            </div>

            <div className="p-4 flex flex-col gap-4 min-h-[300px]" onClick={() => handleVisualClick("bg", false)}>
              {content.phase1[currentLevel].type === "sms" && (
                <div className="flex flex-col gap-4">
                  <p className={`text-center text-xs font-bold uppercase tracking-wider mt-2 p-1 rounded-lg border-2 ${foundDetails.has("sender") ? "border-success text-success bg-success/10" : "border-transparent text-slate-500"}`} onClick={(e) => { e.stopPropagation(); handleVisualClick("sender", (content.phase1[currentLevel] as any).correctTargets.includes("sender")) }}>{(content.phase1[currentLevel] as any).sender || "MinTel"}</p>
                  
                  <div className={`bg-blue-500 text-white p-4 rounded-2xl rounded-tl-sm shadow-md text-sm leading-relaxed border-2 ${foundDetails.has("text") ? "border-success" : "border-transparent"}`} onClick={(e) => { e.stopPropagation(); handleVisualClick("text", (content.phase1[currentLevel] as any).correctTargets.includes("text")) }}>
                    {content.phase1[currentLevel].text}
                    <br/><br/>
                    <button onClick={(e) => { e.stopPropagation(); handleVisualClick("fakeLink", (content.phase1[currentLevel] as any).correctTargets.includes("fakeLink")); }} className={`text-blue-200 underline font-bold w-full text-left break-all border-2 p-1 rounded-lg ${foundDetails.has("fakeLink") ? "border-success text-success bg-success/20" : "border-transparent"}`}>{(content.phase1[currentLevel] as any).fakeLink}</button>
                  </div>
                </div>
              )}
              {content.phase1[currentLevel].type === "call" && (
                <div className="flex flex-col items-center justify-center h-full pt-10">
                  <div className={`w-20 h-20 bg-slate-300 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 ${foundDetails.has("avatar") ? "border-success text-success bg-success/10" : "border-transparent"}`} onClick={(e) => { e.stopPropagation(); handleVisualClick("avatar", (content.phase1[currentLevel] as any).correctTargets.includes("avatar")); }}>
                    <User className="size-10 text-slate-500" />
                  </div>
                  <p className={`text-xl font-bold p-1 rounded-lg border-2 mb-1 ${foundDetails.has("caller") ? "border-success text-success bg-success/10" : "border-transparent text-slate-800 dark:text-slate-100"}`} onClick={(e) => { e.stopPropagation(); handleVisualClick("caller", (content.phase1[currentLevel] as any).correctTargets.includes("caller")); }}>{(content.phase1[currentLevel] as any).caller}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleVisualClick("number", (content.phase1[currentLevel] as any).correctTargets.includes("number")); }} className={`text-danger font-black text-lg tracking-wider px-3 py-1 rounded-lg border-2 ${foundDetails.has("number") ? "border-success bg-success/10 text-success" : "bg-danger/10 border-danger/20"}`}>{(content.phase1[currentLevel] as any).number}</button>
                  <div className="flex gap-8 mt-12 w-full justify-center" onClick={(e) => { e.stopPropagation(); handleVisualClick("action", false); }}>
                    <div className="w-14 h-14 bg-danger rounded-full flex items-center justify-center shadow-lg"><Phone className="text-white transform rotate-[135deg]" /></div>
                    <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-lg"><Phone className="text-white" /></div>
                  </div>
                </div>
              )}
              {content.phase1[currentLevel].type === "profile" && (
                <div className="flex flex-col items-center pt-8">
                  <div className={`w-24 h-24 bg-neon/20 rounded-full flex items-center justify-center mb-4 border-4 ${foundDetails.has("avatar") ? "border-success bg-success/10" : "border-neon"}`} onClick={(e) => { e.stopPropagation(); handleVisualClick("avatar", (content.phase1[currentLevel] as any).correctTargets.includes("avatar")); }}>
                    <CheckCircle2 className={`size-12 ${foundDetails.has("avatar") ? "text-success" : "text-neon"}`} />
                  </div>
                  <p className={`text-2xl font-bold p-1 rounded-lg border-2 mb-2 ${foundDetails.has("name") ? "border-success text-success bg-success/10" : "border-transparent text-slate-800 dark:text-slate-100"}`} onClick={(e) => { e.stopPropagation(); handleVisualClick("name", (content.phase1[currentLevel] as any).correctTargets.includes("name")); }}>{(content.phase1[currentLevel] as any).name}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleVisualClick("accountType", (content.phase1[currentLevel] as any).correctTargets.includes("accountType")); }} className={`text-sm font-bold px-4 py-2 rounded-xl mb-6 border-2 ${foundDetails.has("accountType") ? "border-success text-success bg-success/10" : "border-transparent text-slate-500 bg-slate-200 dark:bg-slate-800"}`}>
                    {(content.phase1[currentLevel] as any).accountType}
                  </button>
                  <div className="w-full flex justify-around border-t border-slate-300 dark:border-slate-800 pt-4" onClick={(e) => { e.stopPropagation(); handleVisualClick("action", false); }}>
                     <div className="flex flex-col items-center text-neon"><Phone className="size-6 mb-1"/><span className="text-xs">Apel</span></div>
                     <div className="flex flex-col items-center text-neon"><MessageCircle className="size-6 mb-1"/><span className="text-xs">Mesaj</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentPhase === 1 && (
        <div className="w-full flex flex-col items-center animate-in fade-in">
          <p className="font-bold text-center text-lg text-warning mb-6">{content.phase2Intro}</p>
          <div className="w-full bg-slate-900 border-2 border-warning/50 rounded-3xl p-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <div className="flex justify-between items-center mb-6">
               <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{currentLevel + 1} / 10</span>
               <span className={`text-3xl font-black tabular-nums transition-colors ${blitzTimeLeft <= 3 ? 'text-danger animate-pulse' : 'text-warning'}`}>0:0{blitzTimeLeft}</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold mb-8 text-foreground">{content.phase2[currentLevel].text}</p>
            <div className="flex flex-col gap-3">
              {content.phase2[currentLevel].options.map((opt, i) => (
                <button key={i} onClick={() => handleBlitzClick(i)} className="w-full text-left p-4 rounded-xl border border-border bg-background/50 hover:bg-background/80 hover:border-warning/50 transition font-medium text-lg focus-ring">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentPhase === 2 && (
        <div className="w-full flex flex-col items-center animate-in zoom-in-95">
          <p className="font-bold text-center text-lg text-danger mb-6">{content.phase3Intro}</p>
          <div className="w-full bg-slate-950 border-2 border-danger rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-danger/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-6 mb-8">
               <div className="w-24 h-24 flex items-center justify-center rounded-2xl border-2 border-danger/50 shadow-lg bg-slate-900">
                 <Skull className="size-12 text-danger animate-pulse" />
               </div>
               <div className="relative bg-danger/10 border border-danger/30 rounded-2xl p-4 w-full">
                  <div className="absolute top-1/2 -left-3 w-4 h-4 bg-slate-950 border-t border-l border-danger/30 transform -rotate-45 -translate-y-1/2" />
                  <p className="text-lg font-bold text-danger-foreground">{content.phase3[currentLevel].bossText}</p>
               </div>
            </div>
            <div className="flex flex-col gap-3 relative z-10">
              {content.phase3[currentLevel].options.map((opt, i) => (
                <button key={i} onClick={() => handleBossClick(i)} className={`w-full text-left p-4 rounded-xl border transition font-medium text-lg focus-ring ${bossSelected.has(i) ? 'border-success bg-success/20 text-success shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-danger/20 bg-background/50 hover:bg-danger/20 hover:border-danger/50'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
