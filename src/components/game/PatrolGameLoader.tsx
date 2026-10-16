"use client";

import dynamic from "next/dynamic";

import type { PatrolLocale } from "./patrol-scene";

const PatrolGame = dynamic(() => import("./PatrolGame").then((module) => module.PatrolGame), {
  ssr: false,
  loading: () => (
    <div className="grid aspect-[8/5] w-full place-items-center rounded-3xl border border-border bg-card/60 text-muted-foreground">
      …
    </div>
  ),
});

export function PatrolGameLoader({ locale }: { locale: PatrolLocale }) {
  return <PatrolGame locale={locale} />;
}
