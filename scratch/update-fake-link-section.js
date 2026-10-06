const fs = require('fs');

const dataPath = 'src/components/modules/FakeLinkModule.tsx';
let code = fs.readFileSync(dataPath, 'utf8');

const newSection = `
          <section className="min-h-[34rem] rounded-3xl border border-border bg-card/75 p-5 sm:p-8">
            {notice && (
              <div className={\`mb-6 rounded-2xl border p-4 text-sm font-medium \${notice.kind === "success" ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"}\`}>
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
                {currentStage === 0 && <IntroStage locale={locale} content={t.intro} onFinish={submitIntro} />}
                {currentStage === 1 && <TheoryStage content={t.theory} button={t.continue} saving={saving} onComplete={submitTheory} />}
                {currentStage > 1 && currentStage < 9 && (
                  <div className="py-20 text-center">
                    <p className="text-xl font-bold text-muted-foreground">{t.stages[currentStage].title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">В разработке / În dezvoltare</p>
                    <button type="button" onClick={() => { completeStage(currentStage, 100); chooseStage(currentStage < 8 ? currentStage + 1 : 8); }} disabled={saving} className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 disabled:opacity-60">
                      Завершить этап (Dev)
                    </button>
                  </div>
                )}
              </div>
            </NextButtonContext.Provider>
          </section>
`;

code = code.replace(/<section className="min-w-0">[\s\S]*?<\/section>/, newSection);

// Ensure NextButtonContext and StageHeading are imported
if (!code.includes('NextButtonContext')) {
  code = `import { NextButtonContext, StageHeading } from "./operator-call/stage-heading";\n` + code;
}

fs.writeFileSync(dataPath, code);
console.log("Updated section");
