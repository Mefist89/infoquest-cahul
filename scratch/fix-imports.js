const fs = require('fs');

const dataPath = 'src/components/modules/FakeLinkModule.tsx';
let code = fs.readFileSync(dataPath, 'utf8');

// Fix import
code = code.replace(
  /import \{ NextButtonContext, StageHeading \} from "\.\/operator-call\/stage-heading";/g,
  'import { NextButtonContext } from "./operator-call/stage-support";'
);

// Append StageHeading function if not exists
if (!code.includes('function StageHeading')) {
  code += `
function StageHeading({ number, title, subtitle, done }: { number: number; title: string; subtitle: string; done: boolean }) {
  return <div className="flex items-start gap-4"><span className={\`grid size-12 shrink-0 place-items-center rounded-2xl border font-display font-black \${done ? "border-success/40 bg-success/10 text-success" : "border-neon/40 bg-neon/10 text-neon"}\`}>{done ? <Check className="size-5" /> : number === 0 ? <MessageSquare className="size-5" /> : number}</span><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{number === 0 ? "Intro" : \`\${number}/8\`}</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{subtitle}</p></div></div>;
}
`;
}

fs.writeFileSync(dataPath, code);
console.log("Fixed imports");
