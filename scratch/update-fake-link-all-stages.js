const fs = require('fs');

const dataPath = 'src/components/modules/FakeLinkModule.tsx';
let code = fs.readFileSync(dataPath, 'utf8');

// Update icons
code = code.replace(
  /import \{(.*?)\} from "lucide-react";/s,
  `import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Volume2,
  BookOpen,
  Clapperboard,
  Video,
  ScanSearch,
  ListChecks,
  ListOrdered,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";`
);

code = code.replace(
  /const stageIcons = \[MessageSquare, BookOpen\];/g,
  `const stageIcons: LucideIcon[] = [BookOpen, Clapperboard, Video, ScanSearch, ListChecks, MessageSquare, ListOrdered, ShieldAlert];`
);

// Update STAGE_COUNT to 8 (in useModuleRunner) if necessary. Wait, FakeLink doesn't use STAGE_COUNT yet, but wait, `completedStages.size / 1` needs to be `/ 8`.
code = code.replace(/completedStages\.size \/ 1/g, 'completedStages.size / 8');
code = code.replace(/\{`\$\{completedStages\.size\}\/1`\}/g, '{`${completedStages.size}/8`}');
code = code.replace(/aria-valuemax=\{1\}/g, 'aria-valuemax={8}');

// Add placeholder for Next button
code = code.replace(
  /\{currentStage === 0 && <IntroStage locale=\{locale\} content=\{t\.intro\} onFinish=\{submitIntro\} \/>\}/g,
  `<NextButtonContext.Provider value={
                currentStage < 8 ? (
                  <button type="button" disabled={!completedStages.has(currentStage)} onClick={() => chooseStage(currentStage + 1)} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-5 text-sm font-black text-neon transition hover:border-neon hover:bg-neon/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-neon/40 disabled:hover:bg-neon/10">
                    {t.continue}<ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                ) : null
              }>
                {currentStage === 0 && <IntroStage locale={locale} content={t.intro} onFinish={submitIntro} />}
`
);

// Fix TheoryStage onComplete to just completeStage(1, 100) and chooseStage(2). Wait, NextButton handles chooseStage if done.
// In FakeLinkModule, submitTheory does:
//   async function submitTheory() {
//      await completeStage(1, 100);
//   }
// That's fine. NextButtonContext will let them advance if done.
// But we need placeholder stages for 2-8.
code = code.replace(
  /\{currentStage === 1 && <TheoryStage content=\{t\.theory\} button=\{t\.continue\} saving=\{saving\} onComplete=\{submitTheory\} \/>\}/g,
  `{currentStage === 1 && <TheoryStage content={t.theory} button={t.continue} saving={saving} onComplete={submitTheory} />}
                {currentStage > 1 && currentStage < 9 && (
                  <div className="py-20 text-center">
                    <p className="text-xl font-bold text-muted-foreground">{t.stages[currentStage].title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">В разработке / În dezvoltare</p>
                    <button type="button" onClick={() => completeStage(currentStage, 100)} disabled={saving} className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 disabled:opacity-60">
                      Завершить этап (Dev)
                    </button>
                  </div>
                )}
              </NextButtonContext.Provider>`
);

// Add NextButtonContext import if it doesn't exist
if (!code.includes('NextButtonContext')) {
  code = `import { NextButtonContext } from "./operator-call/stage-heading";\n` + code;
}

// StageHeading logic update
code = code.replace(
  /<section className="min-h-\[34rem\] rounded-3xl border border-border bg-card\/75 p-5 sm:p-8">/g,
  `<section className="min-h-[34rem] rounded-3xl border border-border bg-card/75 p-5 sm:p-8">
              {currentStage === 0 ? (
                <StageHeading number={0} title={t.intro.title} subtitle={t.intro.subtitle} done={false} />
              ) : (
                <StageHeading number={currentStage} title={t.stages[currentStage].title} subtitle={t.stages[currentStage].subtitle} done={completedStages.has(currentStage)} />
              )}`
);

// Import StageHeading
if (!code.includes('StageHeading')) {
  code = `import { StageHeading } from "./operator-call/stage-heading";\n` + code;
}

fs.writeFileSync(dataPath, code);
console.log("Updated FakeLinkModule.tsx stages");
