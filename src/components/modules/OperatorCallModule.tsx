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
import { useCallback, useEffect, useMemo, useState } from "react";

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

  const [selectedFlags, setSelectedFlags] = useState<Set<string>>(new Set());
  const [classification, setClassification] = useState<Record<string, "safe" | "danger">>({});
  const [dialogueChoice, setDialogueChoice] = useState<string | null>(null);
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
    if (stage === 0 || stage <= unlockedThrough || completedStages.has(stage)) {
      setCurrentStage(stage);
      setFeedback(null);
      setNotice(null);
    }
  }

  async function submitFlags() {
    const mistakes = t.flags.options.filter((option) => selectedFlags.has(option.id) !== option.correct).length;
    const score = Math.round(((t.flags.options.length - mistakes) / t.flags.options.length) * 100);
    setFeedback({ stage: 4, score });
    await completeStage(4, score);
  }

  async function submitClassification() {
    const correct = t.classify.items.filter((item) => classification[item.id] === item.answer).length;
    const score = Math.round((correct / t.classify.items.length) * 100);
    setFeedback({ stage: 5, score });
    await completeStage(5, score);
  }

  async function submitDialogue() {
    const choice = t.dialogue.choices.find((item) => item.id === dialogueChoice);
    if (!choice) return;
    setFeedback({ stage: 6, score: choice.score });
    await completeStage(6, choice.score);
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
                const locked = number > unlockedThrough && !done;
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
              {currentStage === 4 && <FlagsStage content={t.flags} selected={selectedFlags} setSelected={setSelectedFlags} check={t.check} saving={saving} feedback={feedback?.stage === 4 ? feedback : null} onSubmit={submitFlags} />}
              {currentStage === 5 && <ClassifyStage content={t.classify} answers={classification} setAnswers={setClassification} check={t.check} saving={saving} feedback={feedback?.stage === 5 ? feedback : null} onSubmit={submitClassification} />}
              {currentStage === 6 && <DialogueStage content={t.dialogue} selected={dialogueChoice} setSelected={setDialogueChoice} check={t.check} saving={saving} feedback={feedback?.stage === 6 ? feedback : null} onSubmit={submitDialogue} />}
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
  return <div><p className="text-base leading-relaxed text-foreground/90">{content.lead}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{content.cards.map((card, index) => <article key={card.title} className="rounded-2xl border border-border bg-background/35 p-5"><span className="text-xs font-black text-neon">0{index + 1}</span><h3 className="mt-3 font-bold">{card.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.text}</p></article>)}</div><p className="mt-5 rounded-2xl border border-neon/30 bg-neon/10 p-5 font-semibold text-neon">{content.rule}</p><ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton></div>;
}

function VideoExplanationStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExplanation"] | (typeof operatorCallContent)["ro"]["videoExplanation"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div><VideoPlaceholder title={content.title} placeholder={content.placeholder} hint={content.hint} /><ul className="mt-5 grid gap-3 sm:grid-cols-2">{content.points.map((point) => <li key={point} className="flex gap-3 rounded-xl border border-border bg-background/35 p-4 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-neon" />{point}</li>)}</ul><ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton></div>;
}

function VideoExampleStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExample"] | (typeof operatorCallContent)["ro"]["videoExample"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div><VideoPlaceholder title={content.title} placeholder={content.placeholder} hint={content.hint} /><div className="mt-5 space-y-3">{content.transcript.map((line, index) => <div key={`${line.speaker}-${index}`} className={`max-w-[88%] rounded-2xl border p-4 ${index % 2 === 0 ? "border-danger/25 bg-danger/5" : "ml-auto border-neon/25 bg-neon/5"}`}><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{line.speaker}</p><p className="mt-1 text-sm">{line.text}</p></div>)}</div><ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton></div>;
}

function VideoPlaceholder({ title, placeholder, hint }: { title: string; placeholder: string; hint: string }) {
  return <div className="overflow-hidden rounded-2xl border border-neon/25 bg-slate-950"><div className="grid aspect-video place-items-center bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.16),transparent_55%)] p-6 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-full border border-neon/40 bg-neon/10 text-neon"><Play className="size-7" /></span><p className="mt-4 font-bold">{placeholder}</p></div></div><div className="border-t border-border p-4"><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{hint}</p></div></div>;
}

function FlagsStage({ content, selected, setSelected, check, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["flags"] | (typeof operatorCallContent)["ro"]["flags"]; selected: Set<string>; setSelected: React.Dispatch<React.SetStateAction<Set<string>>>; check: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  return <div><p className="font-semibold">{content.prompt}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{content.options.map((option) => { const active = selected.has(option.id); return <button key={option.id} type="button" onClick={() => setSelected((previous) => { const next = new Set(previous); if (next.has(option.id)) next.delete(option.id); else next.add(option.id); return next; })} className={`focus-ring flex min-h-20 items-center gap-3 rounded-2xl border p-4 text-left text-sm transition ${active ? "border-neon/60 bg-neon/10" : "border-border bg-background/35 hover:border-neon/30"}`}><span className={`grid size-6 shrink-0 place-items-center rounded-md border ${active ? "border-neon bg-neon text-primary-foreground" : "border-border"}`}>{active && <Check className="size-4" />}</span>{option.label}</button>; })}</div>{feedback && <><ScoreFeedback score={feedback.score} /><p className="mt-3 text-sm text-muted-foreground">{content.result}</p></>}<ActionButton disabled={saving || selected.size === 0} onClick={onSubmit}>{check}</ActionButton></div>;
}

function ClassifyStage({ content, answers, setAnswers, check, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["classify"] | (typeof operatorCallContent)["ro"]["classify"]; answers: Record<string, "safe" | "danger">; setAnswers: React.Dispatch<React.SetStateAction<Record<string, "safe" | "danger">>>; check: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  return <div><p className="font-semibold">{content.prompt}</p><div className="mt-5 space-y-3">{content.items.map((item) => <div key={item.id} className="grid gap-3 rounded-2xl border border-border bg-background/35 p-4 sm:grid-cols-[1fr_auto]"><p className="text-sm">{item.text}</p><div className="flex gap-2">{(["safe", "danger"] as const).map((answer) => <button key={answer} type="button" onClick={() => setAnswers((previous) => ({ ...previous, [item.id]: answer }))} className={`focus-ring min-h-10 rounded-xl border px-3 text-xs font-bold ${answers[item.id] === answer ? answer === "safe" ? "border-success bg-success/15 text-success" : "border-danger bg-danger/15 text-danger" : "border-border text-muted-foreground"}`}>{answer === "safe" ? content.safe : content.danger}</button>)}</div></div>)}</div>{feedback && <ScoreFeedback score={feedback.score} />}<ActionButton disabled={saving || Object.keys(answers).length !== content.items.length} onClick={onSubmit}>{check}</ActionButton></div>;
}

function DialogueStage({ content, selected, setSelected, check, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["dialogue"] | (typeof operatorCallContent)["ro"]["dialogue"]; selected: string | null; setSelected: (value: string) => void; check: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  return <div><div className="rounded-2xl border border-danger/30 bg-danger/5 p-5"><p className="text-sm font-semibold leading-relaxed">{content.prompt}</p></div><div className="mt-5 grid gap-3">{content.choices.map((choice) => <button key={choice.id} type="button" onClick={() => setSelected(choice.id)} className={`focus-ring min-h-14 rounded-2xl border p-4 text-left text-sm transition ${selected === choice.id ? "border-neon/60 bg-neon/10" : "border-border bg-background/35"}`}>{choice.label}</button>)}</div>{feedback && <><ScoreFeedback score={feedback.score} /><p className="mt-3 text-sm text-muted-foreground">{content.result}</p></>}<ActionButton disabled={saving || !selected} onClick={onSubmit}>{check}</ActionButton></div>;
}

function OrderingStage({ content, ordered, setOrdered, check, retry, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["ordering"] | (typeof operatorCallContent)["ro"]["ordering"]; ordered: string[]; setOrdered: React.Dispatch<React.SetStateAction<string[]>>; check: string; retry: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  const shuffled = [content.actions[2], content.actions[0], content.actions[3], content.actions[1]];
  return <div><p className="font-semibold">{content.prompt}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{shuffled.map((action) => { const position = ordered.indexOf(action.id); return <button key={action.id} type="button" disabled={position >= 0} onClick={() => setOrdered((previous) => [...previous, action.id])} className="focus-ring flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-background/35 p-4 text-left text-sm disabled:opacity-40"><span className="grid size-7 shrink-0 place-items-center rounded-full border border-neon/40 text-xs font-bold text-neon">{position >= 0 ? position + 1 : "?"}</span>{action.label}</button>; })}</div>{ordered.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{ordered.map((id, index) => <span key={id} className="rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-xs text-neon">{index + 1}. {content.actions.find((action) => action.id === id)?.label}</span>)}</div>}{feedback && <ScoreFeedback score={feedback.score} />}<div className="flex flex-wrap gap-3"><ActionButton disabled={saving || ordered.length !== content.actions.length} onClick={onSubmit}>{check}</ActionButton><button type="button" onClick={() => setOrdered([])} className="focus-ring mt-6 min-h-12 rounded-xl border border-border px-5 text-sm font-bold text-muted-foreground">{retry}</button></div></div>;
}

function FinalStage({ content, answers, setAnswers, check, retry, saving, feedback, onSubmit }: { content: (typeof operatorCallContent)["ru"]["final"] | (typeof operatorCallContent)["ro"]["final"]; answers: Record<string, number>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>; check: string; retry: string; saving: boolean; feedback: { score: number; passed?: boolean } | null; onSubmit: () => void }) {
  return <div><div className="rounded-2xl border border-gold/35 bg-gold/10 p-5"><ShieldAlert className="size-7 text-gold" /><p className="mt-3 font-semibold leading-relaxed">{content.intro}</p></div><div className="mt-5 space-y-4">{content.questions.map((question, questionIndex) => <fieldset key={question.id} className="rounded-2xl border border-border bg-background/35 p-5"><legend className="px-2 text-sm font-bold">{questionIndex + 1}. {question.text}</legend><div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => <label key={option} className={`focus-within:ring-2 focus-within:ring-neon/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${answers[question.id] === optionIndex ? "border-neon/50 bg-neon/10" : "border-border"}`}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }))} className="accent-cyan-400" />{option}</label>)}</div></fieldset>)}</div>{feedback && <div className={`mt-5 rounded-2xl border p-5 ${feedback.passed ? "border-success/35 bg-success/10 text-success" : "border-danger/35 bg-danger/10 text-danger"}`}><p className="font-display text-2xl font-black">{feedback.score}%</p><p className="mt-2 text-sm">{feedback.passed ? content.win : content.lose}</p></div>}<div className="flex flex-wrap gap-3"><ActionButton disabled={saving || Object.keys(answers).length !== content.questions.length} onClick={onSubmit}>{check}</ActionButton>{feedback && !feedback.passed && <button type="button" onClick={() => setAnswers({})} className="focus-ring mt-6 min-h-12 rounded-xl border border-border px-5 text-sm font-bold text-muted-foreground">{retry}</button>}</div></div>;
}
