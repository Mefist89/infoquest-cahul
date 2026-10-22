"use client";

import * as Phaser from "phaser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Skull } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { PATROL_NPCS } from "@/data/patrol";

import { PatrolScene, type PatrolLocale } from "./patrol-scene";
import { DialogueScene } from "./DialogueScene";
import { PatrolLoadingFrame, usePatrolSpritePrefetch } from "./PatrolStartPanel";

const SHADOW_START = 40;
const SHADOW_HIT = 15;
const SHADOW_MISS = 20;
const SHADOW_DEFEAT = 100;

export function PatrolGame({ locale }: { locale: PatrolLocale }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<PatrolScene | null>(null);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [shadow, setShadow] = useState(SHADOW_START);
  const [phase, setPhase] = useState<"playing" | "won" | "lost" | "loading">("loading");
  const [loading, setLoading] = useState(true);

  const byId = useMemo(() => new Map(PATROL_NPCS.map((npc) => [npc.id, npc])), []);

  // Прогрев спрайтов — после «Старт», параллельно RPC прогресса.
  usePatrolSpritePrefetch();

  function patrolScene(): PatrolScene | null {
    if (sceneRef.current) return sceneRef.current;
    const scene = gameRef.current?.scene.getScene("patrol");
    return scene instanceof PatrolScene ? scene : null;
  }

  const pauseGame = useCallback(() => {
    patrolScene()?.scene.pause();
  }, []);

  useEffect(() => {
    if (loading || !hostRef.current || gameRef.current) return;
    const hostElement = hostRef.current;
    const scene = new PatrolScene(locale);
    sceneRef.current = scene;
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostElement,
      width: 960,
      height: 600,
      backgroundColor: "#060d1f",
      physics: { default: "arcade", arcade: { debug: false } },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: hostElement,
        expandParent: true,
      },
      scene: [scene, DialogueScene],
    });
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __patrolScene?: PatrolScene }).__patrolScene = scene;
    }
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [loading, locale, pauseGame]);

  // Load patrol progress from Supabase
  useEffect(() => {
    let mounted = true;
    async function loadProgress() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_patrol_progress");
      if (!mounted) return;
      if (error) {
        console.error("Failed to load patrol progress:", error);
        setShadow(SHADOW_START);
        setResolvedIds([]);
        setPhase("playing");
        setLoading(false);
        return;
      }
      const result = data?.[0];
      if (result) {
        setShadow(result.shadow_pct);
        setResolvedIds(result.completed_npc_ids ?? []);
        if (result.shadow_pct <= 0) setPhase("won");
        else if (result.shadow_pct >= 100) setPhase("lost");
        else setPhase("playing");
      }
      setLoading(false);
    }
    loadProgress();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDialogueComplete = useCallback(
    (correct: boolean, npcId: string) => {
      const npc = byId.get(npcId);
      if (!npc) return;

      const nextShadow = correct ? Math.max(0, shadow - SHADOW_HIT) : Math.min(SHADOW_DEFEAT, shadow + SHADOW_MISS);
      const nextResolved = resolvedIds.includes(npcId) ? resolvedIds : [...resolvedIds, npcId];
      setShadow(nextShadow);
      setResolvedIds(nextResolved);
      if (nextShadow >= SHADOW_DEFEAT) {
        setPhase("lost");
      } else if (nextResolved.length >= PATROL_NPCS.length) {
        setPhase("won");
      }
      patrolScene()?.markResolved(npcId);

      (async () => {
        const supabase = createClient();
        const { error } = await supabase.rpc("complete_patrol_npc", {
          p_npc_id: npcId,
          p_correct: correct,
        });
        if (error) {
          console.error("Failed to save patrol progress:", error);
        }
      })();
    },
    [byId, resolvedIds, shadow],
  );

  function retry() {
    patrolScene()?.resetPatrol();
    setResolvedIds([]);
    setShadow(SHADOW_START);
    setPhase("playing");
  }

  // Listen for dialogue completion from Phaser scene
  useEffect(() => {
    if (loading) return;
    const scene = patrolScene();
    if (!scene) return;

    const handleDialogueCompleteEvent = (correct: boolean, npcId?: string) => {
      const targetNpcId = npcId ?? scene.getNearNpcId();
      if (!targetNpcId) return;
      handleDialogueComplete(correct, targetNpcId);
    };

    scene.events.on("dialogue-complete", handleDialogueCompleteEvent);
    return () => {
      scene.events.off("dialogue-complete", handleDialogueCompleteEvent);
    };
  }, [loading, resolvedIds, shadow, handleDialogueComplete]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3">
        <Skull className="size-5 shrink-0 animate-pulse text-danger" aria-hidden="true" />
        <p className="text-xs font-black uppercase tracking-widest text-danger">
          {locale === "ro" ? "Umbra" : "Тень"}
        </p>
        <div
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={shadow}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={locale === "ro" ? "Puterea Umbrei" : "Сила Тени"}
        >
          <div className="h-full rounded-full bg-danger transition-[width] duration-500" style={{ width: `${shadow}%` }} />
        </div>
        <p className="text-xs font-bold text-muted-foreground">
          {resolvedIds.length}/{PATROL_NPCS.length}
        </p>
      </div>

      {loading ? (
        <PatrolLoadingFrame label={locale === "ro" ? "Pregătire pentru patrulare..." : "Подготовка к патрулированию..."} />
      ) : (
        <div className="relative aspect-[8/5] w-full overflow-hidden rounded-3xl border border-neon/30 bg-[#060d1f]">
          <div
            ref={hostRef}
            className="h-full w-full bg-[#060d1f] [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:bg-[#060d1f]"
          />
        </div>
      )}

      <div aria-live="polite" className="mt-4">
        {phase === "won" && (
          <div className="rounded-2xl border border-success/40 bg-success/10 p-5 text-center">
            <p className="text-lg font-black text-success">
              {locale === "ro" ? "Patrula reușită! Orașul e în siguranță." : "Патруль удался! Город в безопасности."}
            </p>
            <button
              type="button"
              onClick={retry}
              className="focus-ring mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon px-5 text-sm font-black text-primary-foreground"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {locale === "ro" ? "Patrulează din nou" : "Патрулировать снова"}
            </button>
          </div>
        )}
        {phase === "lost" && (
          <div className="rounded-2xl border border-danger/40 bg-danger/10 p-5 text-center" role="alert">
            <p className="text-lg font-black text-danger">
              {locale === "ro" ? "Umbra a pus stăpânire pe oraș…" : "Тень захватила город…"}
            </p>
            <button
              type="button"
              onClick={retry}
              className="focus-ring mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-danger px-6 text-sm font-black text-white"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {locale === "ro" ? "Încearcă din nou" : "Попробовать ещё"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
