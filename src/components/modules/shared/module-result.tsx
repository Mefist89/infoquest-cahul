"use client";

import Link from "next/link";
import { Award, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

export type NextModule = { title: string; href: string } | null;
export type ModuleResultContent = {
  title: string; xp: string; nextModule: string; profile: string; allCompleted: string; saveRetry: string;
};

export function ModuleResult({ locale, content, badge, nextModule, moduleXp }: {
  locale: "ru" | "ro"; content: ModuleResultContent; badge: string; nextModule: NextModule; moduleXp: number;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  return (
    <div role="status" className="flex min-w-0 flex-col items-center gap-5 py-6 text-center">
      <h2 ref={headingRef} tabIndex={-1} className="focus-ring text-3xl font-black text-foreground">{content.title}</h2>
      <div className="flex w-full max-w-lg min-w-0 flex-col items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-6">
        <Award className="size-16 text-gold" aria-hidden="true" />
        <p className="break-words text-xl font-bold text-foreground">{badge}</p>
        <p className="text-xl font-black text-gold">{content.xp.replace("{xp}", String(moduleXp))}</p>
      </div>
      {!nextModule && <p className="text-xl font-bold text-success">{content.allCompleted}</p>}
      <div className="flex w-full max-w-lg flex-col gap-3">
        {nextModule && <Link href={nextModule.href} className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-neon px-5 py-4 text-base font-black text-primary-foreground">
          <span className="min-w-0 break-words">{content.nextModule.replace("{title}", nextModule.title)}</span><ArrowRight className="size-5 shrink-0" aria-hidden="true" />
        </Link>}
        <Link href={`/${locale}/profile`} className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-base font-bold ${nextModule ? "border border-border text-foreground" : "bg-neon text-primary-foreground"}`}>{content.profile}</Link>
      </div>
    </div>
  );
}

export function SaveRetryButton({ label, onRetry, disabled }: { label: string; onRetry: () => Promise<boolean>; disabled: boolean }) {
  return <button type="button" onClick={() => { void onRetry(); }} disabled={disabled} className="focus-ring mt-4 min-h-12 rounded-xl border border-danger/40 px-5 py-3 text-base font-bold text-danger disabled:opacity-50">{label}</button>;
}
