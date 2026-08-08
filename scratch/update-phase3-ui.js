const fs = require('fs');
const path = 'src/components/modules/OperatorCallModule.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Change MAX_BOSS_HP
code = code.replace('const MAX_BOSS_HP = 3;', 'const MAX_BOSS_HP = 10;');

// 2. Add bossSelected state
code = code.replace(
  'const [foundDetails, setFoundDetails] = useState<Set<string>>(new Set());',
  'const [foundDetails, setFoundDetails] = useState<Set<string>>(new Set());\n  const [bossSelected, setBossSelected] = useState<Set<number>>(new Set());'
);

// 3. Clear bossSelected on advanceLevel and restart
code = code.replace(
  'setFoundDetails(new Set());',
  'setFoundDetails(new Set());\n    setBossSelected(new Set());'
);

code = code.replace(
  'setFoundDetails(new Set());',
  'setFoundDetails(new Set());\n    setBossSelected(new Set());'
);

// 4. Update handleBossClick
code = code.replace(
  /const handleBossClick = \(optionIndex: number\) => \{[\s\S]*?\}\s*\};\s*/,
  `const handleBossClick = (optionIndex: number) => {
    const answers = (content.phase3[currentLevel] as any).answers;
    const isCorrect = answers.includes(optionIndex);
    
    if (isCorrect) {
      setBossSelected(prev => {
        const next = new Set(prev);
        next.add(optionIndex);
        
        if (next.size >= answers.length) {
          setBossHp(hp => {
            const nextHp = hp - 1;
            if (nextHp <= 0) {
              setStatus("win");
            } else {
              advanceLevel();
            }
            return nextHp;
          });
          return new Set();
        }
        return next;
      });
    } else {
      takeDamage();
      setBossSelected(new Set());
    }
  };\n\n`
);

// 5. Update Phase 3 JSX (highlight selected options)
const newPhase3Ui = `<div className="flex flex-col gap-3 relative z-10">
              {content.phase3[currentLevel].options.map((opt, i) => (
                <button key={i} onClick={() => handleBossClick(i)} className={\`w-full text-left p-4 rounded-xl border transition font-medium text-lg focus-ring \${bossSelected.has(i) ? 'border-success bg-success/20 text-success shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-danger/20 bg-background/50 hover:bg-danger/20 hover:border-danger/50'}\`}>
                  {opt}
                </button>
              ))}
            </div>`;

code = code.replace(
  /<div className="flex flex-col gap-3 relative z-10">[\s\S]*?<\/div>/,
  newPhase3Ui
);

fs.writeFileSync(path, code);
console.log("Updated OperatorCallModule.tsx phase 3 UI successfully");
