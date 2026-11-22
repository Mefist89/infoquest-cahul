"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export type ModuleNoticeData = { kind: "success" | "error"; text: string } | null;

export function ModuleNotice({ notice }: { notice: ModuleNoticeData }) {
  const [hiddenNotice, setHiddenNotice] = useState<ModuleNoticeData>(null);

  useEffect(() => {
    if (!notice || notice.kind !== "success") return;
    const timer = window.setTimeout(() => setHiddenNotice(notice), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;

  if (notice.kind === "error") {
    return (
      <p role="alert" className="mb-6 rounded-2xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
        {notice.text}
      </p>
    );
  }

  if (hiddenNotice === notice) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-20 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-success/45 bg-card/95 px-4 py-2.5 text-sm font-semibold text-success shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur-md"
    >
      <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
      <span>{notice.text}</span>
    </div>
  );
}
