"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Compass,
  Lock,
  Play,
  Sparkles,
} from "lucide-react";
import Phaser from "phaser";
import { useEffect, useRef, useState } from "react";

import { MISSION_NPCS, type MissionId, type MissionNpc } from "./city-map-data";
import { escapeLabCopy, type EscapeLocale } from "./escape-lab-copy";
import { CityScene } from "./phaser/CityScene";

export function RetroCityCanvas({
  locale,
  completedMissions,
  collectedStars,
  bossUnlocked,
  initialPlayerPos,
  onPlayerMove,
  onCollectStar,
  onStartMission,
  onBossLockedHit,
}: {
  locale: EscapeLocale;
  completedMissions: ReadonlySet<MissionId>;
  collectedStars: ReadonlySet<string>;
  bossUnlocked: boolean;
  initialPlayerPos: { x: number; y: number };
  onPlayerMove: (pos: { x: number; y: number }) => void;
  onCollectStar: (starId: string) => void;
  onStartMission: (id: MissionId) => void;
  onBossLockedHit: () => void;
}) {
  const t = escapeLabCopy[locale];
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<CityScene | null>(null);
  const initialPosRef = useRef(initialPlayerPos);

  const [nearbyNpc, setNearbyNpc] = useState<MissionNpc | null>(null);

  const callbacksRef = useRef({
    onPlayerMove,
    onCollectStar,
    onStartMission,
    onBossLockedHit,
  });
  useEffect(() => {
    callbacksRef.current = {
      onPlayerMove,
      onCollectStar,
      onStartMission,
      onBossLockedHit,
    };
  }, [onPlayerMove, onCollectStar, onStartMission, onBossLockedHit]);

  const latestDataRef = useRef({
    locale,
    completedMissions,
    collectedStars,
    bossUnlocked,
  });
  useEffect(() => {
    latestDataRef.current = {
      locale,
      completedMissions,
      collectedStars,
      bossUnlocked,
    };
    sceneRef.current?.syncBridge({
      locale,
      completedMissions,
      collectedStars,
      bossUnlocked,
    });
  }, [locale, completedMissions, collectedStars, bossUnlocked]);

  // Mount Phaser 3 Game running CityScene
  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;

    const scene = new CityScene({
      locale: latestDataRef.current.locale,
      initialPos: initialPosRef.current,
      completedMissions: latestDataRef.current.completedMissions,
      collectedStars: latestDataRef.current.collectedStars,
      bossUnlocked: latestDataRef.current.bossUnlocked,
      onNearbyNpcChange: (npc) => setNearbyNpc(npc),
      onPlayerMove: (pos) => callbacksRef.current.onPlayerMove(pos),
      onCollectStar: (id) => callbacksRef.current.onCollectStar(id),
      onStartMission: (id) => callbacksRef.current.onStartMission(id),
      onBossLockedHit: () => callbacksRef.current.onBossLockedHit(),
    });
    sceneRef.current = scene;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      backgroundColor: "#080f1f",
      width: Math.max(320, parent.clientWidth || 800),
      height: Math.max(340, parent.clientHeight || 500),
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.NO_CENTER,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [scene],
    });

    return () => {
      sceneRef.current = null;
      game.destroy(true);
    };
  }, []);

  function setDpad(dx: number, dy: number) {
    sceneRef.current?.setDpad(dx, dy);
  }

  function guideToNpc(id: MissionId) {
    sceneRef.current?.guideToNpc(id);
  }

  const nearbyLocked = nearbyNpc ? nearbyNpc.missionId === 4 && !bossUnlocked : false;
  const nearbyDone = nearbyNpc ? completedMissions.has(nearbyNpc.missionId) : false;

  return (
    <div className="space-y-3">
      {/* Main Phaser 3 Retro GTA City Viewport */}
      <div className="relative h-[400px] w-full overflow-hidden rounded-3xl border-2 border-neon/45 bg-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:h-[500px] lg:h-[540px]">
        <div
          ref={hostRef}
          className="size-full cursor-crosshair touch-none select-none [&>canvas]:block [&>canvas]:size-full"
          aria-label={t.title}
        />

        {/* Top-left quick controls pill */}
        <div className="pointer-events-none absolute left-3 top-3 hidden max-w-md items-center gap-2 rounded-2xl border border-neon/35 bg-slate-950/85 px-3.5 py-2 text-sm font-bold text-slate-200 backdrop-blur sm:inline-flex">
          <Compass className="size-4 shrink-0 text-neon" aria-hidden="true" />
          <span>{t.city.controlsHint}</span>
        </div>

        {/* Floating Proximity Mission Card inside viewport bottom when near an NPC */}
        {nearbyNpc && (
          <div className="absolute inset-x-3 bottom-3 z-10 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-gold/70 bg-slate-950/95 p-3.5 shadow-[0_0_32px_rgba(255,209,102,0.28)] backdrop-blur sm:p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-block size-3 rounded-full"
                  style={{ backgroundColor: nearbyNpc.color }}
                  aria-hidden="true"
                />
                <span className="font-display text-base font-black text-gold">
                  {locale === "ro" ? nearbyNpc.nameRo : nearbyNpc.nameRu}
                </span>
                <span className="text-sm font-bold text-foreground">
                  · {locale === "ro" ? nearbyNpc.titleRo : nearbyNpc.titleRu}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {nearbyLocked
                  ? t.city.bossLocked
                  : locale === "ro"
                    ? nearbyNpc.shortRo
                    : nearbyNpc.shortRu}
              </p>
            </div>

            {nearbyLocked ? (
              <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-danger/55 bg-danger/15 px-4 text-sm font-black text-danger">
                <Lock className="size-4" aria-hidden="true" />
                3/3
              </span>
            ) : (
              <button
                type="button"
                onClick={() => sceneRef.current?.triggerNearbyMission()}
                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-5 text-sm font-black text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.45)] transition hover:brightness-110"
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                {nearbyDone ? t.city.replayMission : `${t.city.enterMission} (E)`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom City Bar: Character Mission Compass Pills + Mobile D-Pad */}
      <div className="flex flex-col gap-3 rounded-3xl border border-neon/30 bg-card/85 p-3.5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="min-w-0 flex-1 space-y-2.5">
          <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Sparkles className="size-4 shrink-0 text-gold" aria-hidden="true" />
            <span>{t.city.walkToNpc}</span>
          </p>

          <div className="flex flex-wrap gap-2">
            {MISSION_NPCS.map((npc) => {
              const done = completedMissions.has(npc.missionId);
              const locked = npc.missionId === 4 && !bossUnlocked;
              return (
                <button
                  key={npc.missionId}
                  type="button"
                  onClick={() => guideToNpc(npc.missionId)}
                  className={`focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-black transition ${
                    done
                      ? "border-success/55 bg-success/15 text-success hover:bg-success/25"
                      : locked
                        ? "border-danger/40 bg-danger/10 text-danger/90 hover:bg-danger/15"
                        : "border-neon/45 bg-slate-950/75 text-foreground hover:border-gold hover:text-gold"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                  ) : locked ? (
                    <Lock className="size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <span
                      className="inline-grid size-5 place-items-center rounded-full bg-gold text-sm font-black text-slate-950"
                      aria-hidden="true"
                    >
                      !
                    </span>
                  )}
                  <span>{locale === "ro" ? npc.nameRo : npc.nameRu}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Touch/Mouse D-Pad */}
        <div
          className="mx-auto grid w-fit grid-cols-3 gap-1.5 sm:mx-0"
          role="group"
          aria-label="D-Pad"
        >
          <span />
          <button
            type="button"
            onPointerDown={() => setDpad(0, -1)}
            onPointerUp={() => setDpad(0, 0)}
            onPointerLeave={() => setDpad(0, 0)}
            onPointerCancel={() => setDpad(0, 0)}
            aria-label="Up"
            className="focus-ring grid size-11 select-none touch-none place-items-center rounded-xl border border-neon/40 bg-slate-950/85 text-neon active:bg-neon active:text-slate-950"
          >
            <ArrowUp className="size-5" aria-hidden="true" />
          </button>
          <span />
          <button
            type="button"
            onPointerDown={() => setDpad(-1, 0)}
            onPointerUp={() => setDpad(0, 0)}
            onPointerLeave={() => setDpad(0, 0)}
            onPointerCancel={() => setDpad(0, 0)}
            aria-label="Left"
            className="focus-ring grid size-11 select-none touch-none place-items-center rounded-xl border border-neon/40 bg-slate-950/85 text-neon active:bg-neon active:text-slate-950"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onPointerDown={() => setDpad(0, 1)}
            onPointerUp={() => setDpad(0, 0)}
            onPointerLeave={() => setDpad(0, 0)}
            onPointerCancel={() => setDpad(0, 0)}
            aria-label="Down"
            className="focus-ring grid size-11 select-none touch-none place-items-center rounded-xl border border-neon/40 bg-slate-950/85 text-neon active:bg-neon active:text-slate-950"
          >
            <ArrowDown className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onPointerDown={() => setDpad(1, 0)}
            onPointerUp={() => setDpad(0, 0)}
            onPointerLeave={() => setDpad(0, 0)}
            onPointerCancel={() => setDpad(0, 0)}
            aria-label="Right"
            className="focus-ring grid size-11 select-none touch-none place-items-center rounded-xl border border-neon/40 bg-slate-950/85 text-neon active:bg-neon active:text-slate-950"
          >
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
