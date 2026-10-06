const fs = require('fs');

const dataPath = 'src/components/modules/FakeLinkModule.tsx';
let code = fs.readFileSync(dataPath, 'utf8');

// Fix submitIntro and submitTheory
code = code.replace(
  /async function submitIntro\(\) \{\s*await completeStage\(1, 100\);\s*chooseStage\(1\);\s*\}/g,
  `async function submitIntro() {
    chooseStage(1);
  }`
);

code = code.replace(
  /async function submitTheory\(\) \{\s*await completeStage\(2, 100\);\s*\}/g,
  `async function submitTheory() {
    await completeStage(1, 100);
  }`
);

// Fix completedStages.size / 2 to size / 1 (since there's only 1 DB stage so far: Theory)
code = code.replace(
  /const completionPercent = Math\.round\(\(completedStages\.size \/ 2\) \* 100\);/g,
  'const completionPercent = Math.round((completedStages.size / 1) * 100);'
);
code = code.replace(/value=\{`\$\{completedStages\.size\}\/2`\}/g, 'value={`${completedStages.size}/1`}');
code = code.replace(/aria-valuemax=\{2\}/g, 'aria-valuemax={1}');

// Fix unlockedThrough
code = code.replace(
  /const unlockedThrough = useMemo\(\(\) => \{\n\s*return Math\.max\(1, \.\.\.Array\.from\(completedStages\)\.map\(\(s\) => s \+ 1\)\);\n\s*\}, \[completedStages\]\);/g,
  `const unlockedThrough = useMemo(() => {
    return Math.max(1, ...Array.from(completedStages).map((s) => s + 1));
  }, [completedStages]);`
);

// Now for the sidebar HTML.
// Intro is stage 0. Theory is stage 1 in UI, and stage 1 in DB.
const newSidebar = `
            <aside className="rounded-3xl border border-border bg-card/70 p-4 lg:sticky lg:top-24 lg:self-start">
              <p className="px-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{t.progress}</p>
              <button type="button" onClick={() => chooseStage(0)} className={\`focus-ring mt-3 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition \${currentStage === 0 ? "border-neon/60 bg-neon/10" : "border-border bg-background/25"}\`}>
                <span className={\`grid size-10 shrink-0 place-items-center rounded-xl \${currentStage === 0 ? "bg-neon/15 text-neon" : "bg-secondary text-muted-foreground"}\`}><MessageSquare className="size-4" /></span>
                <span className="min-w-0"><span className="block text-xs text-muted-foreground">Intro</span><span className="block truncate text-sm font-bold text-foreground">{t.intro.title}</span></span>
              </button>
              
              <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {t.stages.slice(1).map((stage, index) => {
                  const number = index + 1; // 1 for Theory
                  const dbStage = number;   // 1 for Theory
                  const Icon = stageIcons[number] || BookOpen;
                  const done = completedStages.has(dbStage);
                  const locked = !done && dbStage > unlockedThrough;
                  const active = currentStage === number;
                  return (
                    <li key={stage.title}>
                      <button type="button" onClick={() => chooseStage(number)} disabled={locked} className={\`focus-ring flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition \${active ? "border-neon/60 bg-neon/10" : done ? "border-success/30 bg-success/5" : "border-border bg-background/25"} disabled:cursor-not-allowed disabled:opacity-45\`}>
                        <span className={\`grid size-10 shrink-0 place-items-center rounded-xl \${done ? "bg-success/15 text-success" : active ? "bg-neon/15 text-neon" : "bg-secondary text-muted-foreground"}\`}>{locked ? <Lock className="size-4" /> : done ? <Check className="size-4" /> : <Icon className="size-4" />}</span>
                        <span className="min-w-0"><span className="block text-xs text-muted-foreground">{dbStage}/1 {stage.subtitle}</span><span className="block truncate text-sm font-bold text-foreground">{stage.title}</span></span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </aside>
`;

code = code.replace(/<aside[\s\S]*?<\/aside>/, newSidebar);

fs.writeFileSync(dataPath, code);
console.log("Replaced sidebar and logic");
