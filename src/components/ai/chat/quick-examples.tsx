"use client";

import type { Dispatch, SetStateAction } from "react";
import type { ChatContent } from "@/data/chrono-content";
import type { AiMode, AnalyzerInputMode } from "./types";

export function QuickExamples({ t, setAnalyzerInputMode, setDrafts }: { t: ChatContent; setAnalyzerInputMode: Dispatch<SetStateAction<AnalyzerInputMode>>; setDrafts: Dispatch<SetStateAction<Record<AiMode, string>>> }) {
  return (
                    <div className="rounded-2xl border border-neon/20 bg-neon/5 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wider text-neon">{t.quickTitle}</p>
                  <div className="flex flex-wrap gap-2">
                    {t.quickExamples.map(([label, prompt], index) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          if (index === t.quickExamples.length - 1) {
                            setAnalyzerInputMode("audio");
                          } else {
                            setAnalyzerInputMode("text");
                            setDrafts((current) => ({ ...current, analyzer: prompt }));
                          }
                        }}
                        className="focus-ring min-h-10 rounded-xl border border-border bg-card/70 px-3 py-2 text-left text-xs font-bold text-foreground transition hover:border-neon/60 hover:bg-neon/10 hover:text-neon"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
  );
}
