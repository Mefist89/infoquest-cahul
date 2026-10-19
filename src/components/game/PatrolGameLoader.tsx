"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { PatrolLocale } from "./patrol-scene";
import { PatrolLoadingFrame, PatrolStartPanel } from "./PatrolStartPanel";

const PatrolGame = dynamic(() => import("./PatrolGame").then((module) => module.PatrolGame), {
  ssr: false,
  loading: () => <PatrolLoadingFrame />,
});

export function PatrolGameLoader({ locale }: { locale: PatrolLocale }) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <PatrolStartPanel locale={locale} onStart={() => setStarted(true)} />;
  }

  return <PatrolGame locale={locale} />;
}
