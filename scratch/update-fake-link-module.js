const fs = require('fs');

const dataPath = 'src/components/modules/FakeLinkModule.tsx';
let code = fs.readFileSync(dataPath, 'utf8');

// Add BookOpen icon
code = code.replace(/MessageSquare,/g, 'MessageSquare,\n  BookOpen,');
code = code.replace(/const stageIcons = \[MessageSquare\];/g, 'const stageIcons = [MessageSquare, BookOpen];');

// Add unlockedThrough logic for stage 2
code = code.replace(
  /const unlockedThrough = useMemo\(\(\) => \{\n    return 1; \/\/ Unlocked for now\n  \}, \[completedStages\]\);/g,
  `const unlockedThrough = useMemo(() => {
    return Math.max(1, ...Array.from(completedStages).map((s) => s + 1));
  }, [completedStages]);`
);

// Update completionPercent
code = code.replace(
  /const completionPercent = Math\.round\(\(completedStages\.size \/ 1\) \* 100\);/g,
  'const completionPercent = Math.round((completedStages.size / 2) * 100);'
);

// Add submitTheory function
code = code.replace(
  /async function submitIntro\(\) \{\n    await completeStage\(1, 100\);\n  \}/g,
  `async function submitIntro() {
    await completeStage(1, 100);
    chooseStage(1);
  }

  async function submitTheory() {
    await completeStage(2, 100);
  }`
);

// Update HeaderStat max
code = code.replace(/completedStages\.size\}\/1/g, 'completedStages.size}/2');
code = code.replace(/aria-valuemax=\{1\}/g, 'aria-valuemax={2}');

// Add Theory button in sidebar
code = code.replace(
  /<\/aside>/g,
  `  {unlockedThrough >= 2 ? (
              <button type="button" onClick={() => chooseStage(1)} className={\`focus-ring mt-3 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition \${currentStage === 1 ? "border-neon/60 bg-neon/10" : "border-border bg-background/25"}\`}>
                <span className={\`grid size-10 shrink-0 place-items-center rounded-xl \${currentStage === 1 ? "bg-neon/15 text-neon" : "bg-secondary text-muted-foreground"}\`}><BookOpen className="size-4" /></span>
                <span className="min-w-0"><span className="block text-xs text-muted-foreground">{t.stages[1].subtitle}</span><span className="block truncate text-sm font-bold text-foreground">{t.stages[1].title}</span></span>
              </button>
            ) : (
              <div className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-background/25 p-3 text-left opacity-60">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground"><Lock className="size-4" /></span>
                <span className="min-w-0"><span className="block text-xs text-muted-foreground">{t.stages[1].subtitle}</span><span className="block truncate text-sm font-bold text-muted-foreground">{t.stages[1].title}</span></span>
              </div>
            )}
          </aside>`
);

// Render TheoryStage
code = code.replace(
  /\{currentStage === 0 && <IntroStage locale=\{locale\} content=\{t\.intro\} onFinish=\{submitIntro\} \/>\}/g,
  `{currentStage === 0 && <IntroStage locale={locale} content={t.intro} onFinish={submitIntro} />}
            {currentStage === 1 && <TheoryStage content={t.theory} button={t.continue} saving={saving} onComplete={submitTheory} />}`
);

// Append TheoryStage component
code += `
function TheoryStage({ content, button, saving, onComplete }: { content: (typeof fakeLinkContent)["ru"]["theory"] | (typeof fakeLinkContent)["ro"]["theory"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div>
    <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">{content.lead}</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{content.cards.map((card, index) => <article key={card.title} className="rounded-3xl border border-border bg-background/40 p-5 sm:p-6 shadow-[0_5px_20px_rgba(0,0,0,0.1)] transition hover:border-neon/40 hover:bg-background/60"><span className="text-sm font-black tracking-widest text-neon/60">0{index + 1}</span><h3 className="mt-3 text-lg sm:text-xl font-black text-foreground">{card.title}</h3><p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">{card.text}</p></article>)}</div>
    <p className="mt-8 rounded-3xl border border-neon/40 bg-neon/10 p-6 sm:p-8 text-lg sm:text-xl font-bold text-neon shadow-[0_0_30px_rgba(0,217,255,0.1)]">{content.rule}</p>
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <button type="button" onClick={onComplete} disabled={saving} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_38px_rgba(0,217,255,0.5)] disabled:opacity-60">{button}</button>
    </div>
  </div>;
}
`;

fs.writeFileSync(dataPath, code);
console.log("Updated FakeLinkModule.tsx");
