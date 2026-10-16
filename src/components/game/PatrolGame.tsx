"use client";

import * as Phaser from "phaser";
import { useEffect, useRef } from "react";

import { PatrolScene, type PatrolLocale } from "./patrol-scene";

export function PatrolGame({ locale }: { locale: PatrolLocale }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 960,
      height: 600,
      backgroundColor: "#060d1f",
      physics: { default: "arcade", arcade: { debug: false } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [new PatrolScene(locale)],
    });
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className="aspect-[8/5] w-full overflow-hidden rounded-3xl border border-neon/30 bg-[#060d1f]" />;
}
