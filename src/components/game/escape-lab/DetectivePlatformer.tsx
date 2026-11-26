"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Heart,
  Search,
  Sparkles,
} from "lucide-react";
import Phaser from "phaser";
import { useEffect, useRef, useState } from "react";

import type { MissionId } from "./city-map-data";
import { escapeLabCopy, type EscapeLocale } from "./escape-lab-copy";
import { PlatformerScene } from "./phaser/PlatformerScene";
import { PLATFORMER_LEVELS } from "./platformer-levels";

export function DetectivePlatformer({
  locale,
  missionId,
  hintSignal,
  onComplete,
}: {
  locale: EscapeLocale;
  missionId: MissionId;
  hintSignal: number;
  onComplete: () => void;
}) {
  const level = PLATFORMER_LEVELS[missionId];
  const t = escapeLabCopy[locale];
  const pt = t.platformer;

  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<PlatformerScene | null>(null);
  const touchStateRef = useRef({ left: false, right: false });
  const localeRef = useRef(locale);

  const [foundClues, setFoundClues] = useState<string[]>([]);
  const [hearts, setHearts] = useState(3);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [reachedNpcReady, setReachedNpcReady] = useState(false);

  useEffect(() => {
    localeRef.current = locale;
    sceneRef.current?.setLocale(locale);
  }, [locale]);

  useEffect(() => {
    if (hintSignal > 0) {
      sceneRef.current?.activateHintRadar();
    }
  }, [hintSignal]);

  // Mount Phaser 3 Game running PlatformerScene
  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;

    const scene = new PlatformerScene({
      locale: localeRef.current,
      missionId,
      onCluesChange: (list) => setFoundClues(list),
      onHeartsChange: (h) => setHearts(h),
      onStatusBanner: (msg) => setStatusBanner(msg),
      onReadyForPuzzle: () => setReachedNpcReady(true),
    });
    sceneRef.current = scene;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      backgroundColor: level.bgTop,
      width: Math.max(320, parent.clientWidth || 800),
      height: Math.max(300, parent.clientHeight || 380),
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.NO_CENTER,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 1520 },
          debug: false,
        },
      },
      scene: [scene],
    });

    return () => {
      sceneRef.current = null;
      game.destroy(true);
    };
  }, [missionId, level.bgTop]);

  function setTouchMove(left: boolean, right: boolean) {
    touchStateRef.current = { left, right };
    sceneRef.current?.setTouchControls(left, right);
  }

  function triggerJump() {
    sceneRef.current?.queueJump();
  }

  const hintBanner =
    hintSignal > 0
      ? foundClues.length < level.clues.length
        ? pt.hintClue
        : pt.hintNpc
      : null;

  return (
    <div className="space-y-3 rounded-3xl border-2 border-neon/40 bg-slate-950/90 p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-5">
      {/* Platformer Header: Title, Clues 0/3, Hearts */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-black text-foreground sm:text-xl">
            {locale === "ro" ? level.titleRo : level.titleRu}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{pt.controlsTip}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Clue Checklist Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-gold/45 bg-gold/10 px-3 py-1.5">
            <Search className="size-4 text-gold" aria-hidden="true" />
            <span className="text-sm font-black text-gold">
              {pt.cluesLabel}: {foundClues.length}/{level.clues.length}
            </span>
            {level.clues.map((clue) => {
              const got = foundClues.includes(clue.id);
              return (
                <span
                  key={clue.id}
                  title={locale === "ro" ? clue.labelRo : clue.labelRu}
                  className={`inline-grid size-7 place-items-center rounded-lg border text-sm transition ${
                    got
                      ? "border-success/70 bg-success/20 opacity-100"
                      : "border-slate-700 bg-slate-900/80 opacity-45 grayscale"
                  }`}
                >
                  {clue.emoji}
                </span>
              );
            })}
          </div>

          {/* Hearts */}
          <div
            className="flex items-center gap-1 rounded-2xl border border-danger/40 bg-danger/10 px-3 py-2"
            aria-label={`${hearts}/3`}
          >
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`size-5 ${
                  h <= hearts ? "fill-danger text-danger" : "text-slate-600"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hint or Status Banner */}
      {(hintBanner || statusBanner) && (
        <div
          role="status"
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-sm font-bold ${
            reachedNpcReady
              ? "border-success/70 bg-success/15 text-success"
              : "border-gold/55 bg-gold/15 text-gold"
          }`}
        >
          <span className="flex items-center gap-2">
            {reachedNpcReady ? (
              <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4 shrink-0" aria-hidden="true" />
            )}
            {statusBanner ?? hintBanner}
          </span>

          {reachedNpcReady && (
            <button
              type="button"
              onClick={onComplete}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-success px-5 text-sm font-black text-slate-950 shadow-[0_0_24px_rgba(34,197,94,0.4)] transition hover:brightness-110"
            >
              {pt.enterPuzzleBtn}
            </button>
          )}
        </div>
      )}

      {/* Phaser 3 Side-Scrolling 2D Platformer Viewport */}
      <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border-2 border-neon/35 bg-slate-950 sm:h-[380px]">
        <div
          ref={hostRef}
          className="size-full touch-none select-none [&>canvas]:block [&>canvas]:size-full"
          aria-label={locale === "ro" ? level.titleRo : level.titleRu}
        />

        {/* Big Overlay CTA when Detective reaches NPC with all 3 clues */}
        {reachedNpcReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <div className="max-w-md rounded-3xl border-2 border-success/80 bg-slate-950/95 p-6 text-center shadow-[0_0_40px_rgba(34,197,94,0.35)]">
              <p className="font-display text-xl font-black text-success">{pt.reachedNpcTitle}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {level.clues.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 rounded-xl border border-gold/50 bg-gold/15 px-3 py-1.5 text-sm font-bold text-gold"
                  >
                    <span>{c.emoji}</span>
                    <span>{locale === "ro" ? c.labelRo : c.labelRu}</span>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={onComplete}
                className="focus-ring mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-neon px-7 font-display text-base font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.45)] transition hover:brightness-110"
              >
                {pt.enterPuzzleBtn}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch & Mouse Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onPointerDown={() => setTouchMove(true, touchStateRef.current.right)}
            onPointerUp={() => setTouchMove(false, touchStateRef.current.right)}
            onPointerLeave={() => setTouchMove(false, touchStateRef.current.right)}
            onPointerCancel={() => setTouchMove(false, touchStateRef.current.right)}
            aria-label="Left"
            className="focus-ring grid size-14 select-none touch-none place-items-center rounded-2xl border-2 border-neon/45 bg-slate-900 text-neon active:bg-neon active:text-slate-950"
          >
            <ArrowLeft className="size-7" aria-hidden="true" />
          </button>
          <button
            type="button"
            onPointerDown={() => setTouchMove(touchStateRef.current.left, true)}
            onPointerUp={() => setTouchMove(touchStateRef.current.left, false)}
            onPointerLeave={() => setTouchMove(touchStateRef.current.left, false)}
            onPointerCancel={() => setTouchMove(touchStateRef.current.left, false)}
            aria-label="Right"
            className="focus-ring grid size-14 select-none touch-none place-items-center rounded-2xl border-2 border-neon/45 bg-slate-900 text-neon active:bg-neon active:text-slate-950"
          >
            <ArrowRight className="size-7" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onPointerDown={triggerJump}
          className="focus-ring inline-flex min-h-14 select-none touch-none items-center gap-2 rounded-2xl border-2 border-gold/75 bg-gold/20 px-6 font-display text-base font-black text-gold shadow-[0_0_20px_rgba(255,209,102,0.2)] active:bg-gold active:text-slate-950"
        >
          <ArrowUp className="size-6" aria-hidden="true" />
          {pt.jumpBtn}
        </button>
      </div>
    </div>
  );
}
