const fs = require('fs');

const dataPath = 'src/components/modules/FakeLinkModule.tsx';
let code = fs.readFileSync(dataPath, 'utf8');

// Icons
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

// firstOpenStage and length
code = code.replace(
  /length: 1/g,
  'length: 8'
);

// completionPercent
code = code.replace(
  /\(completedStages\.size \/ 1\) \* 100/g,
  '(completedStages.size / 8) * 100'
);

// HeaderStat progress
code = code.replace(
  /value=\{`\$\{completedStages\.size\}\/1`\}/g,
  'value={`${completedStages.size}/8`}'
);
code = code.replace(
  /aria-valuemax=\{1\}/g,
  'aria-valuemax={8}'
);

// Sidebar map loop
code = code.replace(
  /t\.stages\.slice\(1\)\.map\(\(stage, index\) => \{/g,
  `t.stages.slice(1).map((stage, index) => {`
);

// Inside the map loop, update dbStage and UI number
// Previously: dbStage = number (where number = index + 1)
// We want: dbStage = index + 1 (1 to 8)
// And UI should show index + 1/8
code = code.replace(
  /\{dbStage\}\/1/g,
  `{dbStage}/8`
);

// Add placeholders for remaining stages
code = code.replace(
  /\{currentStage === 1 && <TheoryStage content=\{t\.theory\} button=\{t\.continue\} saving=\{saving\} onComplete=\{submitTheory\} \/>\}/g,
  `{currentStage === 1 && <TheoryStage content={t.theory} button={t.continue} saving={saving} onComplete={submitTheory} />}
                {currentStage > 1 && currentStage < 9 && (
                  <div className="py-20 text-center">
                    <p className="text-xl font-bold text-muted-foreground">{t.stages[currentStage].title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">В разработке / În dezvoltare</p>
                    <button type="button" onClick={() => { completeStage(currentStage, 100); chooseStage(currentStage < 8 ? currentStage + 1 : 8); }} disabled={saving} className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 disabled:opacity-60">
                      Завершить этап (Dev)
                    </button>
                  </div>
                )}`
);

fs.writeFileSync(dataPath, code);
console.log("Updated FakeLinkModule.tsx to 8 stages");
