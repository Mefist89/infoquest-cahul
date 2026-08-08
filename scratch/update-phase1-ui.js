const fs = require('fs');
const path = 'src/components/modules/OperatorCallModule.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add foundDetails state
code = code.replace(
  'const [currentLevel, setCurrentLevel] = useState(0);',
  'const [currentLevel, setCurrentLevel] = useState(0);\n  const [foundDetails, setFoundDetails] = useState<Set<string>>(new Set());'
);

// 2. Clear foundDetails on advanceLevel and restart
code = code.replace(
  'const advanceLevel = () => {',
  'const advanceLevel = () => {\n    setFoundDetails(new Set());'
);

code = code.replace(
  'setBlitzTimeLeft(7);\n  };',
  'setBlitzTimeLeft(7);\n    setFoundDetails(new Set());\n  };'
);

// 3. Update handleVisualClick
code = code.replace(
  /const handleVisualClick = \(isCorrect: boolean\) => \{[\s\S]*?\}\s*\};\s*/,
  `const handleVisualClick = (targetId: string, isCorrect: boolean) => {
    if (isCorrect) {
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
      takeDamage();
    }
  };\n\n`
);

// 4. Update the Phase 1 UI (the whole w-full max-w-sm div)
const newPhase1Ui = `<div className="w-full max-w-sm bg-slate-100 dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
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
                  <p className={\`text-center text-xs font-bold uppercase tracking-wider mt-2 p-1 rounded-lg border-2 \${foundDetails.has("sender") ? "border-success text-success bg-success/10" : "border-transparent text-slate-500"}\`} onClick={(e) => { e.stopPropagation(); handleVisualClick("sender", (content.phase1[currentLevel] as any).correctTargets.includes("sender")) }}>{(content.phase1[currentLevel] as any).sender || "MinTel"}</p>
                  
                  <div className={\`bg-blue-500 text-white p-4 rounded-2xl rounded-tl-sm shadow-md text-sm leading-relaxed border-2 \${foundDetails.has("text") ? "border-success" : "border-transparent"}\`} onClick={(e) => { e.stopPropagation(); handleVisualClick("text", (content.phase1[currentLevel] as any).correctTargets.includes("text")) }}>
                    {content.phase1[currentLevel].text}
                    <br/><br/>
                    <button onClick={(e) => { e.stopPropagation(); handleVisualClick("fakeLink", (content.phase1[currentLevel] as any).correctTargets.includes("fakeLink")); }} className={\`text-blue-200 underline font-bold w-full text-left break-all border-2 p-1 rounded-lg \${foundDetails.has("fakeLink") ? "border-success text-success bg-success/20" : "border-transparent"}\`}>{(content.phase1[currentLevel] as any).fakeLink}</button>
                  </div>
                </div>
              )}
              {content.phase1[currentLevel].type === "call" && (
                <div className="flex flex-col items-center justify-center h-full pt-10">
                  <div className={\`w-20 h-20 bg-slate-300 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 \${foundDetails.has("avatar") ? "border-success text-success bg-success/10" : "border-transparent"}\`} onClick={(e) => { e.stopPropagation(); handleVisualClick("avatar", (content.phase1[currentLevel] as any).correctTargets.includes("avatar")); }}>
                    <User className="size-10 text-slate-500" />
                  </div>
                  <p className={\`text-xl font-bold p-1 rounded-lg border-2 mb-1 \${foundDetails.has("caller") ? "border-success text-success bg-success/10" : "border-transparent text-slate-800 dark:text-slate-100"}\`} onClick={(e) => { e.stopPropagation(); handleVisualClick("caller", (content.phase1[currentLevel] as any).correctTargets.includes("caller")); }}>{(content.phase1[currentLevel] as any).caller}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleVisualClick("number", (content.phase1[currentLevel] as any).correctTargets.includes("number")); }} className={\`text-danger font-black text-lg tracking-wider px-3 py-1 rounded-lg border-2 \${foundDetails.has("number") ? "border-success bg-success/10 text-success" : "bg-danger/10 border-danger/20"}\`}>{(content.phase1[currentLevel] as any).number}</button>
                  <div className="flex gap-8 mt-12 w-full justify-center" onClick={(e) => { e.stopPropagation(); handleVisualClick("action", false); }}>
                    <div className="w-14 h-14 bg-danger rounded-full flex items-center justify-center shadow-lg"><Phone className="text-white transform rotate-[135deg]" /></div>
                    <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-lg"><Phone className="text-white" /></div>
                  </div>
                </div>
              )}
              {content.phase1[currentLevel].type === "profile" && (
                <div className="flex flex-col items-center pt-8">
                  <div className={\`w-24 h-24 bg-neon/20 rounded-full flex items-center justify-center mb-4 border-4 \${foundDetails.has("avatar") ? "border-success bg-success/10" : "border-neon"}\`} onClick={(e) => { e.stopPropagation(); handleVisualClick("avatar", (content.phase1[currentLevel] as any).correctTargets.includes("avatar")); }}>
                    <CheckCircle2 className={\`size-12 \${foundDetails.has("avatar") ? "text-success" : "text-neon"}\`} />
                  </div>
                  <p className={\`text-2xl font-bold p-1 rounded-lg border-2 mb-2 \${foundDetails.has("name") ? "border-success text-success bg-success/10" : "border-transparent text-slate-800 dark:text-slate-100"}\`} onClick={(e) => { e.stopPropagation(); handleVisualClick("name", (content.phase1[currentLevel] as any).correctTargets.includes("name")); }}>{(content.phase1[currentLevel] as any).name}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleVisualClick("accountType", (content.phase1[currentLevel] as any).correctTargets.includes("accountType")); }} className={\`text-sm font-bold px-4 py-2 rounded-xl mb-6 border-2 \${foundDetails.has("accountType") ? "border-success text-success bg-success/10" : "border-transparent text-slate-500 bg-slate-200 dark:bg-slate-800"}\`}>
                    {(content.phase1[currentLevel] as any).accountType}
                  </button>
                  <div className="w-full flex justify-around border-t border-slate-300 dark:border-slate-800 pt-4" onClick={(e) => { e.stopPropagation(); handleVisualClick("action", false); }}>
                     <div className="flex flex-col items-center text-neon"><Phone className="size-6 mb-1"/><span className="text-xs">Apel</span></div>
                     <div className="flex flex-col items-center text-neon"><MessageCircle className="size-6 mb-1"/><span className="text-xs">Mesaj</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>`;

code = code.replace(
  /<div className="w-full max-w-sm bg-slate-100 dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-800 rounded-\[2rem\] overflow-hidden shadow-2xl relative">[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*\{currentPhase === 1/,
  `${newPhase1Ui}\n        </div>\n      )}\n\n      {currentPhase === 1`
);

fs.writeFileSync(path, code);
console.log("Updated OperatorCallModule.tsx phase 1 UI successfully");
