"use client";

import { useEffect } from "react";
import NextImage from "next/image";

import type { PatrolLocale } from "./patrol-scene";

const TEXTS = {
  ru: {
    alt: "Эмблема патруля цифрового города",
    start: "Старт",
    loading: "Подготовка к патрулированию...",
  },
  ro: {
    alt: "Emblema patrului orașului digital",
    start: "Pornește",
    loading: "Pregătire pentru patrulare...",
  },
} as const;

const SPRITE_BASES = ["player", "shadow", "npc-female", "npc-male"] as const;

function loadSpriteImage(path: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = path;
  });
}

function loadSpriteXml(path: string) {
  return fetch(path).then(
    () => undefined,
    () => undefined,
  );
}

/** Прогрев спрайтов: к моменту старта сцены Phaser берёт атласы и тайлсеты города из кэша. */
export async function prefetchPatrolSprites(): Promise<void> {
  const cityAssets = [
    "/CP_V1.1.0_nyknck/CP_V1.0.4_nyknck/CP_V1.0.4.png",
    "/CP_V1.1.0_nyknck/Animations/BD001.png",
    "/CP_V1.1.0_nyknck/Animations/BL001.png",
    "/CP_V1.1.0_nyknck/Animations/SL001.png",
  ];
  await Promise.all([
    ...SPRITE_BASES.flatMap((base) => [
      loadSpriteImage(`/game/sprites/${base}.png`),
      loadSpriteXml(`/game/sprites/${base}.xml`),
    ]),
    ...cityAssets.map((url) => loadSpriteImage(url)),
  ]);
}

/** Кадр-«экран» патруля со спиннером: фаза между нажатием «Старт» и готовностью движка. */
export function PatrolLoadingFrame({ label }: { label?: string }) {
  return (
    <div className="relative aspect-[8/5] w-full overflow-hidden rounded-3xl border border-neon/30 bg-[#060d1f]">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" aria-live="polite">
        <div className="size-8 animate-spin rounded-full border-2 border-neon border-t-transparent" aria-hidden="true" />
        {label && <p className="text-sm font-black uppercase tracking-[0.18em] text-neon">{label}</p>}
      </div>
    </div>
  );
}

/** Стартовый экран: статичная картинка и кнопка «Старт». Тяжёлые ресурсы не грузятся. */
export function PatrolStartPanel({ locale, onStart }: { locale: PatrolLocale; onStart: () => void }) {
  const t = TEXTS[locale];

  return (
    <div className="relative aspect-[8/5] w-full overflow-hidden rounded-3xl border border-neon/30 bg-[#060d1f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,217,255,0.16),transparent_62%)]" aria-hidden="true" />
      <NextImage
        src="/patrol-shield.png"
        alt={t.alt}
        fill
        priority
        sizes="(min-width:1200px) 1152px, (min-width:640px) 90vw, 100vw"
        className="object-contain px-24 py-10"
      />
      <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-[#060d1f] via-[#060d1f]/70 to-transparent pb-7 pt-16">
        <button
          type="button"
          onClick={onStart}
          className="focus-ring inline-flex min-h-12 items-center rounded-xl bg-neon px-9 text-base font-black text-primary-foreground shadow-lg transition hover:brightness-110"
        >
          {t.start}
        </button>
      </div>
    </div>
  );
}

/** Крючок-прогрев: вызывается после «Старт» (параллельно чанку и RPC). */
export function usePatrolSpritePrefetch() {
  useEffect(() => {
    void prefetchPatrolSprites();
  }, []);
}
