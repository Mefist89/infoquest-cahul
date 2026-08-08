const fs = require('fs');
const path = 'src/components/modules/OperatorCallModule.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add playSound at the top, just inside or outside the file. Let's put it after imports.
code = code.replace(
  `import { MessageSquare, ShieldAlert, Check, XCircle, CheckCircle2, ChevronRight, Phone, MessageCircle, User, Loader2 } from "lucide-react";`,
  `import { MessageSquare, ShieldAlert, Check, XCircle, CheckCircle2, ChevronRight, Phone, MessageCircle, User, Loader2 } from "lucide-react";\n\nconst playSound = (type: "correct" | "wrong" | "timeout") => {\n  if (typeof window !== "undefined") {\n    const audio = new Audio(\`/audio/\${type}.mp3\`);\n    audio.play().catch(() => {});\n  }\n};`
);

// Stage 4 CallSimulatorStage
code = code.replace(
  `if (isDangerAction) advanceLevel();`,
  `if (isDangerAction) { playSound("correct"); advanceLevel(); }`
);
code = code.replace(
  `else { setStatus("failed"); setFailReason(content.loseThreat); }`,
  `else { playSound("wrong"); setStatus("failed"); setFailReason(content.loseThreat); }`
);
code = code.replace(
  `if (isDangerAction) { setStatus("failed"); setFailReason(content.loseSafe); }`,
  `if (isDangerAction) { playSound("wrong"); setStatus("failed"); setFailReason(content.loseSafe); }`
);
code = code.replace(
  `} else advanceLevel();`,
  `} else { playSound("correct"); advanceLevel(); }`
);

// Stage 5 ClassifyStage
code = code.replace(
  `const answer = direction === "left" ? "danger" : "safe";\n    setAnswers(prev => ({ ...prev, [currentItem.id]: answer }));`,
  `const answer = direction === "left" ? "danger" : "safe";\n    if (answer === (currentItem as any).answer) playSound("correct");\n    else playSound("wrong");\n    setAnswers(prev => ({ ...prev, [currentItem.id]: answer }));`
);

// Stage 6 DialogueStage
code = code.replace(
  `if (correct && selectedLies === level.liesCount) {\n      setCurrentLevelIndex(prev => prev + 1);`,
  `if (correct && selectedLies === level.liesCount) {\n      playSound("correct");\n      setCurrentLevelIndex(prev => prev + 1);`
);
code = code.replace(
  `} else {\n      setErrorText(content.error);\n    }`,
  `} else {\n      playSound("wrong");\n      setErrorText(content.error);\n    }`
);

// Stage 7 OrderingStage
code = code.replace(
  `const newOrderedIds = [...orderedIds, stepId];\n      setOrderedIds(newOrderedIds);`,
  `playSound("correct");\n      const newOrderedIds = [...orderedIds, stepId];\n      setOrderedIds(newOrderedIds);`
);
code = code.replace(
  `} else {\n      setTimeLeft(prev => Math.max(0, prev - 3));\n      setFlashError(true);`,
  `} else {\n      playSound("wrong");\n      setTimeLeft(prev => Math.max(0, prev - 3));\n      setFlashError(true);`
);

// Stage 8 FinalStage
// handleVisualClick
code = code.replace(
  `const handleVisualClick = (targetId: string, isCorrect: boolean) => {\n    if (isCorrect) {`,
  `const handleVisualClick = (targetId: string, isCorrect: boolean) => {\n    if (isCorrect) {\n      playSound("correct");`
);
code = code.replace(
  `} else {\n      takeDamage();\n    }`,
  `} else {\n      playSound("wrong");\n      takeDamage();\n    }`
);

// handleBlitzClick
code = code.replace(
  `const isCorrect = optionIndex === content.phase2[currentLevel].answer;\n    if (isCorrect) {\n      advanceLevel();`,
  `const isCorrect = optionIndex === content.phase2[currentLevel].answer;\n    if (isCorrect) {\n      playSound("correct");\n      advanceLevel();`
);
code = code.replace(
  `} else {\n      takeDamage();\n      advanceLevel();\n    }`,
  `} else {\n      playSound("wrong");\n      takeDamage();\n      advanceLevel();\n    }`
);

// Blitz timeout
code = code.replace(
  `if (blitzTimeLeft <= 0) {\n      takeDamage();\n      advanceLevel();`,
  `if (blitzTimeLeft <= 0) {\n      playSound("timeout");\n      takeDamage();\n      advanceLevel();`
);

// handleBossClick
code = code.replace(
  `const isCorrect = answers.includes(optionIndex);\n    \n    if (isCorrect) {`,
  `const isCorrect = answers.includes(optionIndex);\n    \n    if (isCorrect) {\n      playSound("correct");`
);
code = code.replace(
  `} else {\n      takeDamage();\n      setBossSelected(new Set());\n    }`,
  `} else {\n      playSound("wrong");\n      takeDamage();\n      setBossSelected(new Set());\n    }`
);

fs.writeFileSync(path, code);
console.log("Injected audio cues successfully");
