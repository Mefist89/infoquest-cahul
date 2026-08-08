const fs = require('fs');
const path = 'src/components/modules/OperatorCallModule.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Change props for Stage 4 and Stage 6 to use t.check instead of t.continue
code = code.replace(
  `{currentStage === 4 && <CallSimulatorStage locale={locale} content={t.callSimulator} check={t.continue}`,
  `{currentStage === 4 && <CallSimulatorStage locale={locale} content={t.callSimulator} check={t.check}`
);

code = code.replace(
  `{currentStage === 6 && <DialogueStage content={t.dialogue} check={t.continue}`,
  `{currentStage === 6 && <DialogueStage content={t.dialogue} check={t.check}`
);

// 2. Hide ActionButton in CallSimulatorStage until won
code = code.replace(
  /<div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-4">\s*<ActionButton disabled=\{saving \|\| status !== "won"\} onClick=\{onSubmit\}>\{check\}<\/ActionButton>\s*<\/div>/,
  `{status === "won" && (
        <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-4">
          <ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton>
        </div>
      )}`
);

// 3. Hide ActionButton in ClassifyStage until isComplete
code = code.replace(
  /<div className="mt-6 w-full">\s*<ActionButton disabled=\{saving \|\| !isComplete\} onClick=\{onSubmit\}>\{check\}<\/ActionButton>\s*<\/div>/,
  `{isComplete && (
        <div className="mt-6 w-full">
          <ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton>
        </div>
      )}`
);

// 4. Remove dummy disabled ActionButton in DialogueStage
code = code.replace(
  /<div className="mt-6 w-full">\s*<ActionButton disabled=\{true\} onClick=\{\(\) => \{\}\}>\{check\}<\/ActionButton>\s*<\/div>/,
  ``
);

// Wait, DialogueStage has the active ActionButton rendered when `!level`.
// Let's make sure it is centered.
code = code.replace(
  /<ActionButton disabled=\{saving\} onClick=\{onSubmit\}>\{check\}<\/ActionButton>/g,
  `<ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton>`
);

fs.writeFileSync(path, code);
console.log("Updated button texts and visibility successfully");
