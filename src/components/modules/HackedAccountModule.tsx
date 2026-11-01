"use client";
import React from "react";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  KeyRound,
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

import type { hackedAccountContent, HackedAccountLocale } from "@/data/hacked-account";
import { BreachSignsStage } from "./hacked-account/breach-signs-stage";
import { PasswordGameStage } from "./hacked-account/password-game-stage";
import { RecoveryDialogueStage } from "./hacked-account/recovery-dialogue-stage";
import { RescueOrderStage } from "./hacked-account/rescue-order-stage";
import { FinalBattleStage } from "./hacked-account/final-battle-stage";
import { MODULE_IDS, STAGE_COUNT } from "@/data/module-catalog-meta";
import { useModuleRunner, type ModuleProgress, type StageProgress } from "@/features/modules/runner/use-module-runner";
import { ModuleResult, SaveRetryButton, type NextModule } from "./shared/module-result";
import { MentorIntro } from "./shared/mentor-intro";
import { NoTimerToggle } from "./shared/timer-setting";
import { NextButtonContext } from "./operator-call/stage-support";

function HeaderStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-3 sm:p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon sm:size-12">
        <Icon className="size-5 sm:size-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">{label}</p>
        <p className="mt-0.5 text-lg font-black text-foreground sm:text-xl">{value}</p>
      </div>
    </div>
  );
}

const stageIcons: LucideIcon[] = [BookOpen, Clapperboard, Video, ScanSearch, KeyRound, MessageSquare, ListOrdered, ShieldAlert];

export function HackedAccountModule({ content, locale, initialStages, initialModule, isAdmin, badge, nextModule }: { content: typeof hackedAccountContent[keyof typeof hackedAccountContent]; locale: HackedAccountLocale; initialStages: StageProgress[]; initialModule: ModuleProgress; isAdmin?: boolean; badge: string; nextModule: NextModule }) {
  const t = content;
  const runner = useModuleRunner({
    moduleId: MODULE_IDS.hackedAccount,
    stageCount: STAGE_COUNT,
    initialStages,
    initialModule,
    messages: { locked: t.locked, saved: t.saved, saveError: t.saveError },
  });
  const { completedStages, completionPercent, currentStage, moduleXp, notice, saving, unlockedThrough, chooseStage, completeStage } = runner;

  async function submitIntro() {
    chooseStage(1);
  }

  async function submitTheory() {
    await completeStage(1);
  }

  return (
    <main className="circuit-bg min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center gap-3">
          <NoTimerToggle locale={locale} />
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
            {(["ro", "ru"] as const).map((language) => <Link key={language} href={`/${language}/modules/hacked-account`} className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-2 text-base font-bold uppercase ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground"}`}>{language}</Link>)}
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
              {t.stages.slice(1).map((stage, index) => {
                const number = index + 1;
                const dbStage = number;
                const Icon = stageIcons[index] || BookOpen;
                const done = completedStages.has(dbStage);
                const locked = !done && dbStage > unlockedThrough;
                const active = currentStage === number;
                return (
                  <li key={stage.title}>
                    <button type="button" onClick={() => chooseStage(number)} disabled={locked} className={`focus-ring flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-neon/60 bg-neon/10" : done ? "border-success/30 bg-success/5" : "border-border bg-background/25"} disabled:cursor-not-allowed disabled:opacity-45`}>
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${done ? "bg-success/15 text-success" : active ? "bg-neon/15 text-neon" : "bg-secondary text-muted-foreground"}`}>{locked ? <Lock className="size-4" /> : done ? <Check className="size-4" /> : <Icon className="size-4" />}</span>
                      <span className="min-w-0"><span className="block text-xs text-muted-foreground">{dbStage}/8 {stage.subtitle}</span><span className="block truncate text-sm font-bold text-foreground">{stage.title}</span></span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          <section className="min-h-[34rem] rounded-3xl border border-border bg-card/75 p-5 sm:p-8">
            {currentStage === STAGE_COUNT && completedStages.size === STAGE_COUNT && !saving && notice?.kind !== "error" ? (
              <ModuleResult locale={locale} content={t.result} badge={badge} nextModule={nextModule} moduleXp={moduleXp} />
            ) : (<>
            {notice && (
              <div className={`mb-6 rounded-2xl border p-4 text-sm font-medium ${notice.kind === "success" ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"}`}>
                {notice.text}
              </div>
            )}

            {currentStage === 0 ? (
              <StageHeading number={0} title={t.intro.title} subtitle={t.intro.subtitle} done={false} />
            ) : (
              <StageHeading number={currentStage} title={t.stages[currentStage].title} subtitle={t.stages[currentStage].subtitle} done={completedStages.has(currentStage)} />
            )}
            <NextButtonContext.Provider value={
              currentStage > 0 && currentStage < 8 ? (
                <button type="button" disabled={!completedStages.has(currentStage)} onClick={() => chooseStage(currentStage + 1)} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-5 text-sm font-black text-neon transition hover:border-neon hover:bg-neon/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-neon/40 disabled:hover:bg-neon/10">
                  {t.continue}<ChevronRight className="size-4" aria-hidden="true" />
                </button>
              ) : null
            }>
              <div className="mt-7">
                {currentStage === 0 && <MentorIntro imageSrc={t.intro.image} locale={locale} content={t.intro} onFinish={submitIntro} />}
                {currentStage === 1 && <TheoryStage content={t.theory} button={t.continue} saving={saving} onComplete={submitTheory} />}
                {currentStage === 4 && <BreachSignsStage content={t.breachSigns} saving={saving} onComplete={(result) => completeStage(4, result)} />}
                {currentStage === 5 && <PasswordGameStage locale={locale} content={t.passwordGame} retryLabel={t.retry} saving={saving} onComplete={(result) => completeStage(5, result)} />}
                {currentStage === 6 && <RecoveryDialogueStage content={t.recoveryDialogue} saving={saving} onComplete={(result) => completeStage(6, result)} />}
                {currentStage === 7 && <RescueOrderStage locale={locale} content={t.rescueOrder} checkLabel={t.check} retryLabel={t.retry} saving={saving} onComplete={(result) => completeStage(7, result)} />}
                {currentStage === 8 && <FinalBattleStage content={t.shadowBattle} nextLabel={t.shadowBattle.next} retryLabel={t.retry} saving={saving} onComplete={(result) => completeStage(8, result)} />}
                {currentStage > 1 && currentStage !== 4 && currentStage !== 5 && currentStage !== 6 && currentStage !== 7 && currentStage < 9 && currentStage !== 8 && (
                  <div className="py-20 text-center">
                    <p className="text-xl font-bold text-muted-foreground">{t.stages[currentStage].title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">В разработке / În dezvoltare</p>
                    <button type="button" onClick={() => { completeStage(currentStage); chooseStage(currentStage < 8 ? currentStage + 1 : 8); }} disabled={saving} className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 disabled:opacity-60">
                      Завершить этап (Dev)
                    </button>
                  </div>
                )}
              </div>
            </NextButtonContext.Provider>
            {runner.canRetrySave && <SaveRetryButton label={t.result.saveRetry} onRetry={runner.retrySave} disabled={saving} />}
            </>)}
          </section>
        </div>
      </div>
    </main>
  );
}

function TheoryStage({ content, button, saving, onComplete }: { content: (typeof hackedAccountContent)["ru"]["theory"] | (typeof hackedAccountContent)["ro"]["theory"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div>
    <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">{content.lead}</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{content.cards.map((card, index) => <article key={card.title} className="rounded-3xl border border-border bg-background/40 p-5 sm:p-6 shadow-[0_5px_20px_rgba(0,0,0,0.1)] transition hover:border-neon/40 hover:bg-background/60"><span className="text-sm font-black tracking-widest text-neon/60">0{index + 1}</span><h3 className="mt-3 text-lg sm:text-xl font-black text-foreground">{card.title}</h3><p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">{card.text}</p></article>)}</div>
    <p className="mt-6 rounded-3xl border border-neon/30 bg-background/40 p-5 text-base leading-relaxed text-foreground sm:p-6">{content.recovery}</p>
    <p className="mt-8 rounded-3xl border border-neon/40 bg-neon/10 p-6 sm:p-8 text-lg sm:text-xl font-bold text-neon shadow-[0_0_30px_rgba(0,217,255,0.1)]">{content.rule}</p>
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <button type="button" onClick={onComplete} disabled={saving} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_38px_rgba(0,217,255,0.5)] disabled:opacity-60">{button}</button>
    </div>
  </div>;
}

function StageHeading({ number, title, subtitle, done }: { number: number; title: string; subtitle: string; done: boolean }) {
  return <div className="flex items-start gap-4"><span className={`grid size-12 shrink-0 place-items-center rounded-2xl border font-display font-black ${done ? "border-success/40 bg-success/10 text-success" : "border-neon/40 bg-neon/10 text-neon"}`}>{done ? <Check className="size-5" /> : number === 0 ? <MessageSquare className="size-5" /> : number}</span><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{number === 0 ? "Intro" : `${number}/8`}</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{subtitle}</p></div></div>;
}
