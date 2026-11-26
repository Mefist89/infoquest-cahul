"use client";

import { Bug, CheckCircle2, Cpu, DoorClosed, DoorOpen, RotateCw, Sparkles, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { playSound } from "@/features/sound/play-sound";
import { escapeLabCopy, type EscapeLocale } from "./escape-lab-copy";

type TileKind = "straight" | "elbow" | "tee" | "virus";
type ChipId = "blue" | "gold" | "green";

type InitialTile = { kind: TileKind; rot: number };

const INITIAL_GRID: readonly (readonly InitialTile[])[] = [
  [
    { kind: "straight", rot: 1 },
    { kind: "elbow", rot: 0 },
    { kind: "elbow", rot: 1 },
    { kind: "straight", rot: 1 },
  ],
  [
    { kind: "elbow", rot: 0 },
    { kind: "straight", rot: 0 },
    { kind: "virus", rot: 0 },
    { kind: "tee", rot: 2 },
  ],
  [
    { kind: "tee", rot: 1 },
    { kind: "elbow", rot: 2 },
    { kind: "straight", rot: 1 },
    { kind: "elbow", rot: 1 },
  ],
  [
    { kind: "elbow", rot: 3 },
    { kind: "virus", rot: 0 },
    { kind: "elbow", rot: 0 },
    { kind: "elbow", rot: 3 },
  ],
];

// Directions: 0 = top, 1 = right, 2 = bottom, 3 = left
const BASE_OPENINGS: Record<TileKind, readonly number[]> = {
  straight: [1, 3],
  elbow: [0, 1],
  tee: [0, 1, 3],
  virus: [],
};

const DELTAS: readonly [number, number][] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

function getOpenings(kind: TileKind, rot: number): number[] {
  const shift = ((rot % 4) + 4) % 4;
  return BASE_OPENINGS[kind].map((dir) => (dir + shift) % 4);
}

function computePowered(rotations: readonly (readonly number[])[]) {
  const powered = new Set<string>();
  const startOpenings = getOpenings(INITIAL_GRID[0][0].kind, rotations[0][0]);
  if (!startOpenings.includes(3)) return { powered, reachedExit: false };

  const queue: [number, number][] = [[0, 0]];
  powered.add("0,0");

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const openings = getOpenings(INITIAL_GRID[r][c].kind, rotations[r][c]);
    for (const dir of openings) {
      const [dr, dc] = DELTAS[dir];
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= 4 || nc < 0 || nc >= 4) continue;
      const key = `${nr},${nc}`;
      if (powered.has(key)) continue;
      const neighborKind = INITIAL_GRID[nr][nc].kind;
      if (neighborKind === "virus") continue;
      const neighborOpenings = getOpenings(neighborKind, rotations[nr][nc]);
      if (neighborOpenings.includes((dir + 2) % 4)) {
        powered.add(key);
        queue.push([nr, nc]);
      }
    }
  }

  const exitOpenings = getOpenings(INITIAL_GRID[3][3].kind, rotations[3][3]);
  const reachedExit = powered.has("3,3") && exitOpenings.includes(1);
  return { powered, reachedExit };
}

function PipeSvg({ kind, powered }: { kind: TileKind; powered: boolean }) {
  const stroke = powered ? "#00d9ff" : "#475569";
  const glow = powered ? "drop-shadow(0 0 6px rgba(0,217,255,0.85))" : "none";
  return (
    <svg viewBox="0 0 64 64" className="size-full" style={{ filter: glow }} aria-hidden="true">
      {kind === "straight" && <line x1="0" y1="32" x2="64" y2="32" stroke={stroke} strokeWidth="10" strokeLinecap="round" />}
      {kind === "elbow" && (
        <path d="M 32 0 L 32 24 Q 32 32 40 32 L 64 32" fill="none" stroke={stroke} strokeWidth="10" strokeLinecap="round" />
      )}
      {kind === "tee" && (
        <>
          <line x1="0" y1="32" x2="64" y2="32" stroke={stroke} strokeWidth="10" strokeLinecap="round" />
          <line x1="32" y1="0" x2="32" y2="32" stroke={stroke} strokeWidth="10" strokeLinecap="round" />
        </>
      )}
      <circle cx="32" cy="32" r="6" fill={powered ? "#a5f3fc" : "#64748b"} />
    </svg>
  );
}

const CHIP_STYLES: Record<ChipId, string> = {
  blue: "border-sky-400 bg-sky-500/20 text-sky-200",
  gold: "border-gold bg-gold/20 text-gold",
  green: "border-success bg-success/20 text-success",
};

const TARGET_CHIPS: readonly ChipId[] = ["blue", "gold", "green"];

export function Room2CircuitPuzzle({
  locale,
  hintSignal,
  onSolved,
}: {
  locale: EscapeLocale;
  hintSignal: number;
  onSolved: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const t = escapeLabCopy[locale].room2;

  const [rotations, setRotations] = useState<number[][]>(() =>
    INITIAL_GRID.map((row) => row.map((tile) => tile.rot)),
  );
  const [moves, setMoves] = useState(0);
  const [circuitSolved, setCircuitSolved] = useState(false);

  const [slots, setSlots] = useState<(ChipId | null)[]>([null, null, null]);
  const [logicError, setLogicError] = useState(false);
  const [logicSolved, setLogicSolved] = useState(false);

  const { powered, reachedExit } = useMemo(() => computePowered(rotations), [rotations]);

  function rotateTile(r: number, c: number) {
    if (circuitSolved || INITIAL_GRID[r][c].kind === "virus") return;
    const next = rotations.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? val + 1 : val)),
    );
    setRotations(next);
    setMoves((m) => m + 1);
    const check = computePowered(next);
    if (check.reachedExit) {
      setCircuitSolved(true);
      playSound("correct");
    }
  }

  function placeChip(chip: ChipId) {
    if (logicSolved) return;
    setLogicError(false);
    setSlots((prev) => {
      const existing = prev.indexOf(chip);
      if (existing !== -1) {
        const next = [...prev];
        next[existing] = null;
        return next;
      }
      const empty = prev.indexOf(null);
      if (empty === -1) return prev;
      const next = [...prev];
      next[empty] = chip;
      return next;
    });
  }

  function clearSlot(idx: number) {
    if (logicSolved) return;
    setLogicError(false);
    setSlots((prev) => prev.map((val, i) => (i === idx ? null : val)));
  }

  function checkLogic() {
    if (slots.some((s) => s === null)) return;
    const ok = TARGET_CHIPS.every((chip, idx) => slots[idx] === chip);
    if (ok) {
      setLogicSolved(true);
      playSound("correct");
      window.setTimeout(onSolved, reducedMotion ? 200 : 1000);
    } else {
      setLogicError(true);
      playSound("wrong");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neon/35 bg-slate-950/75 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-black text-neon sm:text-xl">{t.title}</h2>
          <p className="mt-1 text-sm font-semibold text-foreground sm:text-base">
            {!circuitSolved ? t.step1Goal : logicSolved ? t.roomDone : t.step2Goal}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-sm font-bold text-neon">
          <RotateCw className="size-4" aria-hidden="true" />
          {t.movesLabel}: {moves}
        </span>
      </div>

      {hintSignal > 0 && (
        <div className="rounded-2xl border-2 border-gold/60 bg-gold/15 px-4 py-2.5 text-sm font-bold text-gold">
          💡 {!circuitSolved ? t.hintCircuit : t.hintLogic}
        </div>
      )}

      {!circuitSolved ? (
        <div className="rounded-3xl border-2 border-neon/35 bg-[radial-gradient(circle_at_50%_0%,rgba(0,217,255,0.14),rgba(8,18,40,0.98)_70%)] p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-sm font-black text-gold">
              <Zap className="size-4 fill-current" aria-hidden="true" />
              START (1,1)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/50 bg-success/15 px-3 py-1 text-sm font-black text-success">
              {reachedExit ? <DoorOpen className="size-4" aria-hidden="true" /> : <DoorClosed className="size-4" aria-hidden="true" />}
              EXIT (4,4)
            </span>
          </div>

          <div className="mx-auto grid max-w-sm grid-cols-4 gap-2 sm:gap-3">
            {INITIAL_GRID.map((row, r) =>
              row.map((tile, c) => {
                const key = `${r},${c}`;
                const isPowered = powered.has(key);
                const isVirus = tile.kind === "virus";
                const rot = rotations[r][c];
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isVirus}
                    onClick={() => rotateTile(r, c)}
                    aria-label={isVirus ? "Virus" : `${r + 1}-${c + 1}`}
                    className={`focus-ring relative aspect-square overflow-hidden rounded-2xl border-2 p-1 transition ${
                      isVirus
                        ? "cursor-not-allowed border-danger/60 bg-danger/15 text-danger"
                        : isPowered
                          ? "border-neon bg-neon/15 shadow-[0_0_20px_rgba(0,217,255,0.3)]"
                          : "border-slate-700 bg-slate-900/90 hover:border-neon/60"
                    }`}
                  >
                    {r === 0 && c === 0 && (
                      <span className="absolute left-1 top-1 z-10 text-sm font-black text-gold" aria-hidden="true">⚡</span>
                    )}
                    {r === 3 && c === 3 && (
                      <span className="absolute bottom-1 right-1 z-10 text-sm font-black text-success" aria-hidden="true">🚪</span>
                    )}
                    {isVirus ? (
                      <span className="grid size-full place-items-center">
                        <Bug className="size-8 animate-pulse text-danger" aria-hidden="true" />
                      </span>
                    ) : (
                      <motion.span
                        animate={{ rotate: rot * 90 }}
                        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 24 }}
                        className="block size-full"
                      >
                        <PipeSvg kind={tile.kind} powered={isPowered} />
                      </motion.span>
                    )}
                  </button>
                );
              }),
            )}
          </div>
        </div>
      ) : (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={
            logicError && !reducedMotion
              ? { x: [0, -10, 10, -7, 7, 0], opacity: 1, y: 0 }
              : { x: 0, opacity: 1, y: 0 }
          }
          className="rounded-3xl border-2 border-success/55 bg-slate-950/90 p-5 sm:p-6"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-success/50 bg-success/15 px-3.5 py-1 text-sm font-black text-success">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {t.step1Done}
          </p>

          <h3 className="mt-4 font-display text-xl font-black text-foreground">{t.step2Title}</h3>

          <div className="mt-3 rounded-2xl border border-gold/40 bg-gold/10 p-4">
            <p className="font-display text-sm font-black uppercase tracking-wider text-gold">{t.cluesTitle}</p>
            <ul className="mt-2 space-y-1.5 text-sm font-semibold text-foreground sm:text-base">
              {t.clues.map((clue) => (
                <li key={clue}>{clue}</li>
              ))}
            </ul>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {slots.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => clearSlot(idx)}
                className={`focus-ring flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed p-3 text-center transition ${
                  chip ? CHIP_STYLES[chip] : "border-border bg-slate-900/70 text-muted-foreground"
                }`}
              >
                <span className="text-sm font-bold">{t.slotLabel(idx + 1)}</span>
                <span className="font-display text-base font-black">
                  {chip ? t.chips[chip] : "—"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {(["gold", "green", "blue"] as const).map((chip) => {
              const placed = slots.includes(chip);
              return (
                <motion.button
                  key={chip}
                  type="button"
                  onClick={() => placeChip(chip)}
                  whileHover={reducedMotion ? undefined : { scale: 1.04 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  className={`focus-ring inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 px-5 py-2.5 text-base font-black transition ${
                    placed ? "border-border bg-secondary/40 text-muted-foreground" : CHIP_STYLES[chip]
                  }`}
                >
                  <Cpu className="size-5" aria-hidden="true" />
                  {t.chips[chip]}
                </motion.button>
              );
            })}
          </div>

          {logicError && (
            <p role="alert" className="mt-4 text-center text-sm font-bold text-danger">
              {t.wrongLock}
            </p>
          )}

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={checkLogic}
              disabled={slots.some((s) => s === null) || logicSolved}
              className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-2xl bg-neon px-7 text-base font-black text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.3)] disabled:opacity-45"
            >
              <Sparkles className="size-5" aria-hidden="true" />
              {t.checkLock}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
