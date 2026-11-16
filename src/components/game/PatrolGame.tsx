"use client";

import * as Phaser from "phaser";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, RotateCw, Skull } from "lucide-react";

import { MODULE_CATALOG } from "@/data/module-catalog";
import { PATROL_NPCS, PATROL_SCENE_META, type PatrolModuleRoute, type PatrolNpcId } from "@/data/patrol";
import { PATROL_SAFETY_RULES } from "@/data/safety-phrases";
import {
  loadPatrolProgress,
  PATROL_SAVE_ENABLED,
  PATROL_SHADOW_START,
  resetPatrolProgress,
  savePatrolNpcCompletion,
} from "@/features/patrol/progress";

import { PatrolScene, type PatrolLocale } from "./patrol-scene";
import { DialogueScene } from "./DialogueScene";
import { FakeCallScene } from "./FakeCallScene";
import { HackedAccountScene } from "./HackedAccountScene";
import { DeliverySmsTrainerModal } from "./DeliverySmsTrainerModal";
import { PatrolLoadingFrame, usePatrolSpritePrefetch } from "./PatrolStartPanel";
import { getRubikFontFamily } from "./text-style";

const SHADOW_START = PATROL_SHADOW_START;
const SHADOW_HIT = 15;
const SHADOW_MISS = 20;
const SHADOW_DEFEAT = 100;

export function PatrolGame({
  locale,
  isAuthenticated = false,
}: {
  locale: PatrolLocale;
  isAuthenticated?: boolean;
}) {
  const shouldLoadProgress = isAuthenticated && PATROL_SAVE_ENABLED;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<PatrolScene | null>(null);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [mistakeNpcIds, setMistakeNpcIds] = useState<PatrolNpcId[]>([]);
  const [lastMistakeNpcId, setLastMistakeNpcId] = useState<PatrolNpcId | null>(null);
  const [shadow, setShadow] = useState(SHADOW_START);
  const [phase, setPhase] = useState<"playing" | "won" | "lost" | "loading">(
    shouldLoadProgress ? "loading" : "playing",
  );
  const [loading, setLoading] = useState(shouldLoadProgress);
  const [smsTrainerOpen, setSmsTrainerOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [isPortraitTouch, setIsPortraitTouch] = useState(false);
  const [showShadowHelp, setShowShadowHelp] = useState(false);

  const byId = useMemo(
    () => new Map<string, (typeof PATROL_NPCS)[number]>(PATROL_NPCS.map((npc) => [npc.id, npc])),
    [],
  );

  // Прогрев спрайтов — после «Старт», параллельно RPC прогресса.
  usePatrolSpritePrefetch();

  function patrolScene(): PatrolScene | null {
    return sceneRef.current;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia?.("(pointer: coarse)");
    const updateOrientation = () => {
      const isTouch = Boolean(mql?.matches || "ontouchstart" in window || navigator.maxTouchPoints > 0);
      setIsPortraitTouch(isTouch && window.innerWidth < window.innerHeight);
    };
    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);
    mql?.addEventListener?.("change", updateOrientation);
    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
      mql?.removeEventListener?.("change", updateOrientation);
    };
  }, []);

  useEffect(() => {
    patrolScene()?.setOrientationPaused(isPortraitTouch);
  }, [isPortraitTouch, loading]);

  useEffect(() => {
    if (phase === "won" || phase === "lost") {
      patrolScene()?.scene.pause();
    }
  }, [phase]);

  const handleDialogueComplete = useCallback(
    (correct: boolean, npcId: string) => {
      const npc = byId.get(npcId);
      if (!npc) return;

      const nextShadow = correct
        ? Math.max(0, shadow - SHADOW_HIT)
        : Math.min(SHADOW_DEFEAT, shadow + SHADOW_MISS);
      const nextResolved = correct
        ? resolvedIds.includes(npcId)
          ? resolvedIds
          : [...resolvedIds, npcId]
        : resolvedIds;
      setShadow(nextShadow);
      if (correct) {
        setResolvedIds(nextResolved);
        patrolScene()?.markResolved(npcId);
      } else {
        setMistakeNpcIds((prev) => (prev.includes(npc.id) ? prev : [...prev, npc.id]));
        setLastMistakeNpcId(npc.id);
      }
      if (nextShadow >= SHADOW_DEFEAT) {
        setPhase("lost");
      } else if (nextResolved.length >= PATROL_NPCS.length) {
        setPhase("won");
      }
      setSaveError(false);

      if (!isAuthenticated || !PATROL_SAVE_ENABLED) return;

      void (async () => {
        const { error } = await savePatrolNpcCompletion(npcId, correct);
        if (error) {
          setSaveError(true);
        }
      })();
    },
    [byId, isAuthenticated, resolvedIds, shadow],
  );

  const handleDialogueCompleteRef = useRef(handleDialogueComplete);
  useEffect(() => {
    handleDialogueCompleteRef.current = handleDialogueComplete;
  }, [handleDialogueComplete]);

  useEffect(() => {
    if (loading || !hostRef.current || gameRef.current) return;
    let cancelled = false;
    const hostElement = hostRef.current;
    const fullscreenElement = wrapperRef.current ?? hostElement;

    async function initGame() {
      const rubikFamily = getRubikFontFamily();
      try {
        await document.fonts?.load(`16px ${rubikFamily}`);
      } catch {
        // Ignore font load errors in unsupported environments
      }
      if (cancelled || !hostRef.current || gameRef.current) return;

      const scene = new PatrolScene(
        locale,
        (correct, npcId) => {
          handleDialogueCompleteRef.current(correct, npcId);
        },
        () => {
          setSmsTrainerOpen(true);
        },
      );
      sceneRef.current = scene;
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostElement,
        width: 960,
        height: 600,
        backgroundColor: "#060d1f",
        render: {
          antialias: true,
          pixelArt: false,
          roundPixels: true,
        },
        physics: { default: "arcade", arcade: { debug: false } },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          fullscreenTarget: fullscreenElement,
          expandParent: true,
        },
        scene: [scene, DialogueScene, FakeCallScene, HackedAccountScene],
      });
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __patrolScene?: PatrolScene }).__patrolScene = scene;
      }
    }

    void initGame();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [loading, locale]);

  // Load patrol progress from Supabase
  useEffect(() => {
    if (!shouldLoadProgress) return;

    let mounted = true;
    async function loadProgress() {
      const { data, error } = await loadPatrolProgress();
      if (!mounted) return;
      if (error) {
        setShadow(SHADOW_START);
        setResolvedIds([]);
        setPhase("playing");
        setLoading(false);
        return;
      }
      setShadow(data.shadow);
      setResolvedIds(data.resolvedIds);
      if (data.shadow <= 0) setPhase("won");
      else if (data.shadow >= 100) setPhase("lost");
      else setPhase("playing");
      setLoading(false);
    }
    void loadProgress();
    return () => {
      mounted = false;
    };
  }, [shouldLoadProgress]);

  function retry() {
    setSmsTrainerOpen(false);
    setSaveError(false);
    patrolScene()?.resetPatrol();
    patrolScene()?.scene.resume();
    setResolvedIds([]);
    setMistakeNpcIds([]);
    setLastMistakeNpcId(null);
    setShadow(SHADOW_START);
    setPhase("playing");

    if (!isAuthenticated || !PATROL_SAVE_ENABLED) return;

    void (async () => {
      const { error } = await resetPatrolProgress();
      if (error) {
        setSaveError(true);
      }
    })();
  }

  function handleCloseSmsTrainer() {
    setSmsTrainerOpen(false);
    patrolScene()?.scene.resume();
  }

  function handleCompleteSmsTrainer(correct: boolean) {
    setSmsTrainerOpen(false);
    if (correct) {
      patrolScene()?.markResolved("post-maria");
    }
    patrolScene()?.scene.resume();
    handleDialogueComplete(correct, "post-maria");
  }

  const meta = PATROL_SCENE_META[locale];
  const safetyRules = PATROL_SAFETY_RULES[locale];

  function getModuleTitle(route: PatrolModuleRoute): string {
    const mod = MODULE_CATALOG.find((item) => item.route === route);
    return mod ? mod.title[locale] : "";
  }

  const firstTryCount = PATROL_NPCS.filter((npc) => !mistakeNpcIds.includes(npc.id)).length;
  const mistakeNpcs = PATROL_NPCS.filter((npc) => mistakeNpcIds.includes(npc.id));
  const recommendedWinNpcs = mistakeNpcs.length > 0 ? mistakeNpcs : PATROL_NPCS;
  const lastFailedNpc = (lastMistakeNpcId ? byId.get(lastMistakeNpcId) : undefined) ?? PATROL_NPCS[0];

  return (
    <div>
      {PATROL_SAVE_ENABLED && !isAuthenticated && (
        <div className="mb-3 rounded-2xl border border-neon/35 bg-neon/10 px-4 py-3 text-sm">
          <Link
            href={`/${locale}/login?next=/${locale}/patrol`}
            className="focus-ring font-bold text-neon underline-offset-4 hover:underline"
          >
            {meta.guestLoginPrompt}
          </Link>
        </div>
      )}

      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3">
        <Skull className="size-5 shrink-0 animate-pulse text-danger" aria-hidden="true" />
        <p className="text-sm font-black uppercase tracking-widest text-danger">
          {meta.shadowTitle}
        </p>
        <div
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={shadow}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={meta.shadowPowerAria}
        >
          <div className="h-full rounded-full bg-danger transition-[width] duration-500" style={{ width: `${shadow}%` }} />
        </div>
        <button
          type="button"
          onClick={() => setShowShadowHelp((v) => !v)}
          title={meta.shadowExplain}
          aria-label={meta.shadowExplain}
          aria-expanded={showShadowHelp}
          className="focus-ring inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-xs font-black text-danger transition hover:bg-danger/20"
        >
          ?
        </button>
        <p className="text-sm font-bold text-muted-foreground">
          {resolvedIds.length}/{PATROL_NPCS.length}
        </p>
      </div>

      {showShadowHelp && (
        <p className="mb-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-foreground">
          {meta.shadowExplain}
        </p>
      )}

      {loading ? (
        <PatrolLoadingFrame label={meta.loadingLabel} />
      ) : (
        <div
          ref={wrapperRef}
          className="relative aspect-[8/5] w-full overflow-hidden rounded-3xl border border-neon/30 bg-[#060d1f] [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:fullscreen]:bg-[#060d1f]"
        >
          <div
            ref={hostRef}
            className="h-full w-full bg-[#060d1f]"
          />
          {smsTrainerOpen && (
            <DeliverySmsTrainerModal
              locale={locale}
              onClose={handleCloseSmsTrainer}
              onComplete={handleCompleteSmsTrainer}
            />
          )}
          {phase === "won" && (
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-y-auto bg-[#060d1f]/92 p-4 text-center backdrop-blur-sm sm:p-6"
            >
              <div className="my-auto w-full max-w-2xl rounded-2xl border border-success/50 bg-[#071f1e]/95 p-5 sm:p-6">
                <p className="text-lg font-black text-success sm:text-2xl">
                  {meta.victoryBanner}
                </p>
                <p className="mt-1.5 text-sm font-bold text-neon sm:text-base">
                  {meta.firstTrySummary(firstTryCount, PATROL_NPCS.length)}
                </p>

                <div className="mt-4 rounded-xl border border-neon/25 bg-[#0a1528]/90 p-3.5 text-left">
                  <p className="text-xs font-black uppercase tracking-wider text-gold sm:text-sm">
                    {meta.rememberTitle}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-100 sm:text-sm">
                    {PATROL_NPCS.map((npc) => (
                      <li key={npc.id}>
                        <span className="font-black text-neon">{npc.name[locale]}:</span>{" "}
                        {safetyRules[npc.id]}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {recommendedWinNpcs.map((npc) => (
                    <Link
                      key={npc.id}
                      href={`/${locale}${npc.moduleRoute}`}
                      className="focus-ring inline-flex min-h-10 items-center justify-center rounded-xl border border-neon/50 bg-neon/15 px-4 py-2 text-xs font-black text-white transition hover:bg-neon/25 sm:text-sm"
                    >
                      {meta.playCaseBtn(getModuleTitle(npc.moduleRoute))}
                    </Link>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/${locale}/ai-help`}
                    className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-gold/50 bg-gold/15 px-5 text-sm font-black text-gold transition hover:bg-gold/25"
                  >
                    {meta.askChronoBtn}
                  </Link>
                  <button
                    type="button"
                    onClick={retry}
                    className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    {meta.retryWinBtn}
                  </button>
                </div>
              </div>
            </div>
          )}
          {phase === "lost" && (
            <div
              role="alert"
              aria-live="polite"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-y-auto bg-[#060d1f]/92 p-4 text-center backdrop-blur-sm sm:p-6"
            >
              <div className="my-auto w-full max-w-lg rounded-2xl border border-danger/50 bg-[#260b18]/95 p-6">
                <p className="text-lg font-black text-danger sm:text-xl">
                  {meta.defeatBanner}
                </p>
                <div className="mt-4 rounded-xl border border-danger/35 bg-[#14070e]/90 p-3.5 text-left text-sm leading-relaxed text-slate-100">
                  <span className="font-black text-gold">{lastFailedNpc.name[locale]}:</span>{" "}
                  {safetyRules[lastFailedNpc.id]}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/${locale}${lastFailedNpc.moduleRoute}`}
                    className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-neon/50 bg-neon/15 px-5 text-sm font-black text-white transition hover:bg-neon/25"
                  >
                    {meta.playCaseBtn(getModuleTitle(lastFailedNpc.moduleRoute))}
                  </Link>
                  <button
                    type="button"
                    onClick={retry}
                    className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-danger px-6 text-sm font-black text-white"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    {meta.retryLossBtn}
                  </button>
                </div>
              </div>
            </div>
          )}
          {isPortraitTouch && (
            <div
              data-testid="patrol-rotate-overlay"
              role="status"
              aria-live="polite"
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#060d1f]/95 p-6 text-center backdrop-blur-sm"
            >
              <RotateCw className="size-10 text-neon" aria-hidden="true" />
              <p className="max-w-xs text-base font-black text-foreground sm:text-lg">
                {meta.rotatePhonePrompt}
              </p>
            </div>
          )}
        </div>
      )}

      {saveError && (
        <div aria-live="polite" className="mt-4">
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-center text-sm font-bold text-danger">
            {meta.saveErrorNotice}
          </p>
        </div>
      )}
    </div>
  );
}
