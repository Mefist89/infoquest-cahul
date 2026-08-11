"use client";

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
  Lock,
  MessageSquare,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { MODULE_IDS, STAGE_COUNT } from "@/data/module-catalog";
import { operatorCallContent, type OperatorLocale } from "@/data/operator-call";
import { useModuleRunner, type ModuleProgress, type StageProgress } from "@/features/modules/runner/use-module-runner";
import { CallSimulatorStage, ClassifyStage } from "./operator-call/call-classify-stages";
import { DialogueStage, OrderingStage } from "./operator-call/dialogue-ordering-stages";
import { FinalStage } from "./operator-call/final-stage";
import { IntroStage, TheoryStage, VideoExampleStage, VideoExplanationStage } from "./operator-call/intro-media-stages";
import { NextButtonContext } from "./operator-call/stage-support";

const stageIcons: LucideIcon[] = [BookOpen, Clapperboard, Video, ScanSearch, ListChecks, MessageSquare, ListOrdered, ShieldAlert];

export function OperatorCallModule({ locale, initialStages, initialModule, isAdmin }: { locale: OperatorLocale; initialStages: StageProgress[]; initialModule: ModuleProgress; isAdmin?: boolean }) {
  const t = operatorCallContent[locale];
  const runner = useModuleRunner({
    moduleId: MODULE_IDS.operatorCall,
    stageCount: STAGE_COUNT,
    initialStages,
    initialModule,
    messages: { locked: t.locked, saved: t.saved, saveError: t.saveError },
  });
  const { completedStages, completionPercent, currentStage, firstOpenStage, moduleXp, notice, saving, unlockedThrough } = runner;

  const [classification, setClassification] = useState<Record<string, "safe" | "danger">>({});
  const [feedback, setFeedback] = useState<{ stage: number; score: number; passed?: boolean } | null>(null);

  function chooseStage(stage: number) {
    if (runner.chooseStage(stage)) {
      setFeedback(null);
    }
  }

  async function submitCallSimulator() {
    setFeedback({ stage: 4, score: 100 });
    await runner.completeStage(4, 100);
  }

  async function submitClassification() {
    const correct = t.classify.items.filter((item) => classification[item.id] === item.answer).length;
    const score = Math.round((correct / t.classify.items.length) * 100);
    setFeedback({ stage: 5, score });
    await runner.completeStage(5, score);
  }

  async function submitDialogue() {
    setFeedback({ stage: 6, score: 100 });
    await runner.completeStage(6, 100);
  }

  async function submitOrdering() {
    setFeedback({ stage: 7, score: 100 });
    await runner.completeStage(7, 100);
  }

  async function submitFinal() {
    setFeedback({ stage: 8, score: 100 });
    await runner.completeStage(8, 100);
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
                const locked = !done && number > unlockedThrough;
                const active = currentStage === number;
                return (
                  <li key={stage.title}>
                    <button type="button" data-testid={`stage-nav-${number}`} aria-label={`${number}/8. ${stage.title}. ${locked ? t.locked : done ? t.completed : stage.subtitle}`} onClick={() => chooseStage(number)} disabled={locked} className={`focus-ring flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-neon/60 bg-neon/10" : done ? "border-success/30 bg-success/5" : "border-border bg-background/25"} disabled:cursor-not-allowed disabled:opacity-45`}>
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
                {currentStage === 0 && <IntroStage content={t.intro} locale={locale} onFinish={() => runner.openStage(firstOpenStage)} />}
                {currentStage === 1 && <TheoryStage content={t.theory} button={t.continue} saving={saving} onComplete={() => runner.completeStage(1)} />}
                {currentStage === 2 && <VideoExplanationStage content={t.videoExplanation} button={t.continue} saving={saving} onComplete={() => runner.completeStage(2)} />}
                {currentStage === 3 && <VideoExampleStage content={t.videoExample} button={t.continue} saving={saving} onComplete={() => runner.completeStage(3)} />}
                {currentStage === 4 && <CallSimulatorStage locale={locale} content={t.callSimulator} check={t.check} saving={saving} feedback={feedback?.stage === 4 ? feedback : null} onSubmit={submitCallSimulator} />}
                {currentStage === 5 && <ClassifyStage locale={locale} content={t.classify} answers={classification} setAnswers={setClassification} check={t.check} saving={saving} feedback={feedback?.stage === 5 ? feedback : null} onSubmit={submitClassification} />}
                {currentStage === 6 && <DialogueStage locale={locale} content={t.dialogue} check={t.check} saving={saving} feedback={feedback?.stage === 6 ? feedback : null} onSubmit={submitDialogue} />}
                {currentStage === 7 && <OrderingStage locale={locale} content={t.ordering} check={t.check} retry={t.retry} saving={saving} feedback={feedback?.stage === 7 ? feedback : null} onSubmit={submitOrdering} />}
                {currentStage === 8 && <FinalStage locale={locale} content={t.final} check={t.check} retry={t.retry} saving={saving} feedback={feedback?.stage === 8 ? feedback : null} onSubmit={submitFinal} />}
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
