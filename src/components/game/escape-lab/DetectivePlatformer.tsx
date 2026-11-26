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
import { useEffect, useRef, useState } from "react";

import { playSound } from "@/features/sound/play-sound";
import type { MissionId } from "./city-map-data";
import { escapeLabCopy, type EscapeLocale } from "./escape-lab-copy";
import { PLATFORMER_LEVELS } from "./platformer-levels";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
};

type FloatMsg = {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
};

type BotRuntime = {
  id: string;
  x: number;
  y: number;
  minX: number;
  maxX: number;
  speed: number;
  dir: 1 | -1;
  alive: boolean;
};

type MovingPlatRuntime = {
  id: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  speed: number;
};

const PLAYER_W = 28;
const PLAYER_H = 38;
const GRAVITY = 1520;
const MOVE_SPEED = 275;
const JUMP_V = -565;
const DOUBLE_JUMP_V = -525;
const SPRING_V = -770;
const STOMP_BOUNCE_V = -440;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [foundClues, setFoundClues] = useState<string[]>([]);
  const [hearts, setHearts] = useState(3);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [reachedNpcReady, setReachedNpcReady] = useState(false);
  const [radarActive, setRadarActive] = useState(false);

  const controlsRef = useRef({
    left: false,
    right: false,
    jumpQueued: 0,
  });

  const propsRef = useRef({
    locale,
    hintSignal,
    radarActive,
    onComplete,
  });
  useEffect(() => {
    propsRef.current = { locale, hintSignal, radarActive, onComplete };
  }, [locale, hintSignal, radarActive, onComplete]);

  function triggerJump() {
    controlsRef.current.jumpQueued = 0.13;
  }

  // Keyboard bindings
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const code = e.code;
      if (code === "ArrowLeft" || code === "KeyA") {
        if (code.startsWith("Arrow")) e.preventDefault();
        controlsRef.current.left = true;
      } else if (code === "ArrowRight" || code === "KeyD") {
        if (code.startsWith("Arrow")) e.preventDefault();
        controlsRef.current.right = true;
      } else if (code === "ArrowUp" || code === "KeyW" || code === "Space") {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (code === "Space" && (tag === "BUTTON" || tag === "A")) return;
        e.preventDefault();
        if (!e.repeat) {
          controlsRef.current.jumpQueued = 0.13;
        }
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "ArrowLeft" || e.code === "KeyA") controlsRef.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") controlsRef.current.right = false;
    }

    function onBlur() {
      controlsRef.current.left = false;
      controlsRef.current.right = false;
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Main 60 FPS Platformer Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const lv = PLATFORMER_LEVELS[missionId];
    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let viewW = 800;
    let viewH = 380;
    let camX = 0;

    const player = {
      x: lv.spawn.x,
      y: lv.spawn.y,
      vx: 0,
      vy: 0,
      facing: 1 as 1 | -1,
      grounded: false,
      coyote: 0,
      jumpsLeft: 2,
      runPhase: 0,
      invuln: 0,
      respawnX: lv.spawn.x,
      respawnY: lv.spawn.y,
      checkpointReached: false,
      hearts: 3,
      won: false,
      npcRemindCooldown: 0,
    };

    const collectedSet = new Set<string>();
    const bots: BotRuntime[] = lv.bots.map((b) => ({ ...b, dir: 1, alive: true }));
    const movingPlats: MovingPlatRuntime[] = lv.movingPlatforms.map((m) => ({
      id: m.id,
      baseX: m.x,
      baseY: m.y,
      x: m.x,
      y: m.y,
      prevX: m.x,
      prevY: m.y,
      w: m.w,
      h: m.h,
      dx: m.dx,
      dy: m.dy,
      speed: m.speed,
    }));
    let particles: Particle[] = [];
    let floats: FloatMsg[] = [];

    function spawnBurst(x: number, y: number, color: string, count = 12) {
      for (let i = 0; i < count; i += 1) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const spd = 70 + Math.random() * 140;
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 40,
          color,
          size: 3 + Math.random() * 3,
          life: 0.45 + Math.random() * 0.25,
        });
      }
    }

    function hurtPlayer(fallRespawn: boolean) {
      if (player.invuln > 0 && !fallRespawn) return;
      playSound("wrong");
      spawnBurst(player.x + PLAYER_W / 2, player.y + PLAYER_H / 2, "#fb7185", 14);
      player.hearts -= 1;
      if (player.hearts <= 0 || fallRespawn) {
        if (player.hearts <= 0) player.hearts = 3;
        player.x = player.respawnX;
        player.y = player.respawnY - 12;
        player.vx = 0;
        player.vy = 0;
      } else {
        player.vy = -340;
        player.vx = -player.facing * 180;
      }
      player.invuln = 1.25;
      setHearts(player.hearts);
    }

    function resize() {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = Math.max(320, Math.floor(rect.width));
      viewH = Math.max(300, Math.floor(rect.height));
      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    function step(now: number) {
      const dt = Math.min(0.045, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      elapsed += dt;

      const pState = propsRef.current;
      const copy = escapeLabCopy[pState.locale].platformer;

      // 1. Update moving platforms
      for (const mp of movingPlats) {
        mp.prevX = mp.x;
        mp.prevY = mp.y;
        const wave = 0.5 - 0.5 * Math.cos(elapsed * mp.speed);
        mp.x = mp.baseX + mp.dx * wave;
        mp.y = mp.baseY + mp.dy * wave;
      }

      // 2. Player physics (unless already won)
      if (!player.won) {
        const ctrl = controlsRef.current;
        const moveDir = (ctrl.right ? 1 : 0) - (ctrl.left ? 1 : 0);
        if (moveDir !== 0) {
          player.vx = moveDir * MOVE_SPEED;
          player.facing = moveDir as 1 | -1;
          player.runPhase += dt * 13;
        } else {
          player.vx *= Math.pow(0.0008, dt);
          if (Math.abs(player.vx) < 8) player.vx = 0;
        }

        if (ctrl.jumpQueued > 0) ctrl.jumpQueued = Math.max(0, ctrl.jumpQueued - dt);
        if (player.coyote > 0) player.coyote = Math.max(0, player.coyote - dt);
        if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
        if (player.npcRemindCooldown > 0) {
          player.npcRemindCooldown = Math.max(0, player.npcRemindCooldown - dt);
        }

        // Jump & Double Jump
        if (ctrl.jumpQueued > 0) {
          if (player.grounded || player.coyote > 0) {
            player.vy = JUMP_V;
            player.grounded = false;
            player.coyote = 0;
            player.jumpsLeft = 1;
            ctrl.jumpQueued = 0;
            spawnBurst(player.x + PLAYER_W / 2, player.y + PLAYER_H, lv.accent, 6);
          } else if (player.jumpsLeft > 0) {
            player.vy = DOUBLE_JUMP_V;
            player.jumpsLeft -= 1;
            ctrl.jumpQueued = 0;
            spawnBurst(player.x + PLAYER_W / 2, player.y + PLAYER_H, "#ffd166", 9);
          }
        }

        // Apply gravity
        player.vy = Math.min(820, player.vy + GRAVITY * dt);

        // Build solid list (static + moving)
        const solids: { x: number; y: number; w: number; h: number; carryX: number; carryY: number }[] =
          lv.platforms.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h, carryX: 0, carryY: 0 }));
        for (const mp of movingPlats) {
          solids.push({
            x: mp.x,
            y: mp.y,
            w: mp.w,
            h: mp.h,
            carryX: mp.x - mp.prevX,
            carryY: mp.y - mp.prevY,
          });
        }

        // Horizontal movement + collision
        player.x = clamp(player.x + player.vx * dt, 8, lv.worldW - PLAYER_W - 8);
        for (const s of solids) {
          if (rectsOverlap(player.x, player.y + 4, PLAYER_W, PLAYER_H - 8, s.x, s.y, s.w, s.h)) {
            if (player.vx > 0) player.x = s.x - PLAYER_W;
            else if (player.vx < 0) player.x = s.x + s.w;
          }
        }

        // Vertical movement + landing
        const prevBottom = player.y + PLAYER_H;
        player.y += player.vy * dt;
        player.grounded = false;

        for (const s of solids) {
          if (rectsOverlap(player.x + 2, player.y, PLAYER_W - 4, PLAYER_H, s.x, s.y, s.w, s.h)) {
            if (player.vy >= 0 && prevBottom <= s.y + 18) {
              player.y = s.y - PLAYER_H;
              player.vy = 0;
              player.grounded = true;
              player.coyote = 0.11;
              player.jumpsLeft = 2;
              if (s.carryX !== 0) {
                player.x = clamp(player.x + s.carryX, 8, lv.worldW - PLAYER_W - 8);
              }
            } else if (player.vy < 0 && player.y >= s.y + s.h - 16) {
              player.y = s.y + s.h;
              player.vy = 0;
            }
          }
        }

        // Pit fall safety respawn
        if (player.y > lv.worldH + 70) {
          hurtPlayer(true);
        }

        // 3. Bounce Springs
        for (const sp of lv.springs) {
          if (
            player.vy >= 0 &&
            rectsOverlap(player.x, player.y + PLAYER_H - 10, PLAYER_W, 14, sp.x, sp.y, sp.w, 16)
          ) {
            player.vy = SPRING_V;
            player.grounded = false;
            player.jumpsLeft = 1;
            playSound("correct");
            spawnBurst(sp.x + sp.w / 2, sp.y, "#facc15", 10);
          }
        }

        // 4. Checkpoint Flag
        if (
          !player.checkpointReached &&
          Math.abs(player.x + PLAYER_W / 2 - lv.checkpoint.x) < 34 &&
          Math.abs(player.y + PLAYER_H - (lv.checkpoint.y + 52)) < 70
        ) {
          player.checkpointReached = true;
          player.respawnX = lv.checkpoint.x - 10;
          player.respawnY = lv.checkpoint.y;
          playSound("correct");
          spawnBurst(lv.checkpoint.x, lv.checkpoint.y, "#22c55e", 16);
          floats.push({
            x: lv.checkpoint.x,
            y: lv.checkpoint.y - 14,
            text: "CHECKPOINT! 🚩",
            color: "#4ade80",
            life: 1.3,
          });
          setStatusBanner(copy.checkpointToast);
        }

        // 5. Collectible Clues
        for (const clue of lv.clues) {
          if (collectedSet.has(clue.id)) continue;
          const dist = Math.hypot(
            player.x + PLAYER_W / 2 - clue.x,
            player.y + PLAYER_H / 2 - clue.y,
          );
          if (dist < 32) {
            collectedSet.add(clue.id);
            playSound("correct");
            spawnBurst(clue.x, clue.y, "#ffd166", 16);
            floats.push({
              x: clue.x,
              y: clue.y - 16,
              text: copy.foundClueWord,
              color: "#ffd166",
              life: 1.3,
            });
            const list = Array.from(collectedSet);
            setFoundClues(list);
            if (list.length === lv.clues.length) {
              setStatusBanner(copy.allCluesReady);
            }
          }
        }

        // 6. Pulsing Lasers
        for (const lz of lv.lasers) {
          const cycle = (elapsed + lz.phaseOffset) % lz.period;
          const active = cycle < lz.period * 0.46;
          if (
            active &&
            rectsOverlap(player.x + 4, player.y + 4, PLAYER_W - 8, PLAYER_H - 8, lz.x, lz.y, lz.w, lz.h)
          ) {
            hurtPlayer(false);
          }
        }

        // 7. Patrol Bots (stomp from above OR side hit)
        for (const bot of bots) {
          if (!bot.alive) continue;
          bot.x += bot.dir * bot.speed * dt;
          if (bot.x <= bot.minX) {
            bot.x = bot.minX;
            bot.dir = 1;
          } else if (bot.x >= bot.maxX) {
            bot.x = bot.maxX;
            bot.dir = -1;
          }

          if (rectsOverlap(player.x, player.y, PLAYER_W, PLAYER_H, bot.x - 14, bot.y - 12, 28, 24)) {
            const stomping = player.vy > 0 && player.y + PLAYER_H - player.vy * dt <= bot.y + 4;
            if (stomping) {
              bot.alive = false;
              player.vy = STOMP_BOUNCE_V;
              player.jumpsLeft = 1;
              playSound("correct");
              spawnBurst(bot.x, bot.y, "#f43f5e", 16);
              floats.push({
                x: bot.x,
                y: bot.y - 16,
                text: copy.stompWord,
                color: "#ffd166",
                life: 1.0,
              });
            } else {
              hurtPlayer(false);
            }
          }
        }

        // 8. Reaching NPC at the right end
        const npcDist = Math.hypot(
          player.x + PLAYER_W / 2 - lv.npc.x,
          player.y + PLAYER_H / 2 - (lv.npc.y + 22),
        );
        if (npcDist < 54) {
          if (collectedSet.size >= lv.clues.length) {
            player.won = true;
            playSound("correct");
            spawnBurst(lv.npc.x, lv.npc.y, "#22c55e", 26);
            spawnBurst(player.x + 14, player.y, "#ffd166", 20);
            setReachedNpcReady(true);
            setStatusBanner(copy.reachedNpcTitle);
          } else if (player.npcRemindCooldown <= 0) {
            player.npcRemindCooldown = 2.4;
            playSound("wrong");
            setRadarActive(true);
            setStatusBanner(copy.needMoreClues(lv.clues.length - collectedSet.size));
          }
        }
      }

      // 9. Particles & Floating texts
      particles = particles
        .map((ptc) => ({
          ...ptc,
          x: ptc.x + ptc.vx * dt,
          y: ptc.y + ptc.vy * dt,
          vy: ptc.vy + 420 * dt,
          life: ptc.life - dt,
        }))
        .filter((ptc) => ptc.life > 0);

      floats = floats
        .map((f) => ({ ...f, y: f.y - 38 * dt, life: f.life - dt }))
        .filter((f) => f.life > 0);

      // 10. Horizontal side-scrolling camera
      const scaleY = viewH / lv.worldH;
      const worldViewW = viewW / scaleY;
      const targetCamX = clamp(
        player.x + PLAYER_W / 2 - worldViewW * 0.38,
        0,
        Math.max(0, lv.worldW - worldViewW),
      );
      camX += (targetCamX - camX) * Math.min(1, dt * 8);

      // 11. Render Frame
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        const dpr = canvas.width / viewW;
        ctx.save();
        ctx.scale(dpr, dpr);

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, viewH);
        grad.addColorStop(0, lv.bgTop);
        grad.addColorStop(1, lv.bgBottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, viewW, viewH);

        // Scale to world height so the full vertical level is always visible on any screen!
        ctx.scale(scaleY, scaleY);

        // Parallax detective building skyline / windows in background
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        for (let i = 0; i < 16; i += 1) {
          const bx = ((i * 170 - camX * 0.35) % (lv.worldW + 200)) - 80;
          const bh = 120 + (i % 4) * 55;
          ctx.fillRect(bx, lv.worldH - bh - 40, 96, bh);
          ctx.fillStyle = `${lv.accent}22`;
          for (let wy = 0; wy < 3; wy += 1) {
            ctx.fillRect(bx + 14, lv.worldH - bh - 24 + wy * 28, 22, 14);
            ctx.fillRect(bx + 54, lv.worldH - bh - 24 + wy * 28, 22, 14);
          }
          ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        }
        ctx.restore();

        // World Transform
        ctx.save();
        ctx.translate(-camX, 0);

        // Subtle cyber grid
        ctx.strokeStyle = `${lv.accent}12`;
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= lv.worldW; gx += 64) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, lv.worldH);
          ctx.stroke();
        }

        // Static platforms
        for (const p of lv.platforms) {
          ctx.fillStyle = lv.platformFill;
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.w, p.h, p.style === "floor" ? 4 : 7);
          ctx.fill();
          // Neon top trim
          ctx.fillStyle = lv.platformTop;
          ctx.fillRect(p.x + 2, p.y, p.w - 4, 5);
          ctx.strokeStyle = "rgba(255,255,255,0.12)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(p.x, p.y, p.w, p.h);
        }

        // Moving lift platforms
        for (const mp of movingPlats) {
          ctx.fillStyle = "#1e293b";
          ctx.beginPath();
          ctx.roundRect(mp.x, mp.y, mp.w, mp.h, 6);
          ctx.fill();
          ctx.fillStyle = "#ffd166";
          ctx.fillRect(mp.x + 3, mp.y, mp.w - 6, 4);
          ctx.strokeStyle = "#ffd166";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(mp.x, mp.y, mp.w, mp.h);
        }

        // Bounce Springs
        for (const sp of lv.springs) {
          ctx.fillStyle = "#475569";
          ctx.fillRect(sp.x + 4, sp.y + 8, sp.w - 8, 8);
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.roundRect(sp.x, sp.y, sp.w, 8, 4);
          ctx.fill();
          ctx.fillStyle = "#0f172a";
          ctx.font = "900 10px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("▲▲", sp.x + sp.w / 2, sp.y + 7);
        }

        // Checkpoint Flag
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(lv.checkpoint.x - 2, lv.checkpoint.y, 5, 52);
        ctx.fillStyle = player.checkpointReached ? "#22c55e" : "#64748b";
        ctx.beginPath();
        ctx.moveTo(lv.checkpoint.x + 3, lv.checkpoint.y + 2);
        ctx.lineTo(lv.checkpoint.x + 34, lv.checkpoint.y + 13);
        ctx.lineTo(lv.checkpoint.x + 3, lv.checkpoint.y + 24);
        ctx.closePath();
        ctx.fill();

        // Pulsing Lasers
        for (const lz of lv.lasers) {
          const cycle = (elapsed + lz.phaseOffset) % lz.period;
          const active = cycle < lz.period * 0.46;
          const warning = !active && cycle > lz.period * 0.8;
          // Emitter caps
          ctx.fillStyle = "#334155";
          ctx.fillRect(lz.x - 4, lz.y - 6, lz.w + 8, 8);
          ctx.fillRect(lz.x - 4, lz.y + lz.h - 2, lz.w + 8, 8);

          if (active) {
            ctx.fillStyle = "rgba(244, 63, 94, 0.35)";
            ctx.fillRect(lz.x - 5, lz.y, lz.w + 10, lz.h);
            ctx.fillStyle = "#fb7185";
            ctx.fillRect(lz.x + 2, lz.y, lz.w - 4, lz.h);
          } else if (warning) {
            ctx.strokeStyle = "rgba(251, 113, 133, 0.7)";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(lz.x + lz.w / 2, lz.y);
            ctx.lineTo(lz.x + lz.w / 2, lz.y + lz.h);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Collectible Detective Clues
        for (const clue of lv.clues) {
          if (collectedSet.has(clue.id)) continue;
          const bob = Math.sin(elapsed * 4.5 + clue.x) * 5;
          ctx.save();
          ctx.fillStyle = "rgba(255, 209, 102, 0.22)";
          ctx.beginPath();
          ctx.arc(clue.x, clue.y + bob, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffd166";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(clue.x, clue.y + bob, 17, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = "18px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(clue.emoji, clue.x, clue.y + bob + 1);
          ctx.restore();
        }

        // Patrol Virus Bots
        for (const bot of bots) {
          if (!bot.alive) continue;
          ctx.save();
          ctx.translate(bot.x, bot.y);
          // Body
          ctx.fillStyle = "#e11d48";
          ctx.beginPath();
          ctx.roundRect(-14, -12, 28, 22, 7);
          ctx.fill();
          ctx.strokeStyle = "#fda4af";
          ctx.lineWidth = 2;
          ctx.stroke();
          // Glowing visor eyes
          ctx.fillStyle = "#fef08a";
          ctx.fillRect(bot.dir === 1 ? 1 : -9, -6, 8, 5);
          // Antenna
          ctx.strokeStyle = "#fda4af";
          ctx.beginPath();
          ctx.moveTo(0, -12);
          ctx.lineTo(0, -19);
          ctx.stroke();
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.arc(0, -20, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Target NPC at the end of the level
        {
          const nx = lv.npc.x;
          const ny = lv.npc.y;
          const allFound = collectedSet.size >= lv.clues.length;
          // Glowing rescue pad
          ctx.fillStyle = allFound ? "rgba(34, 197, 94, 0.25)" : "rgba(255, 209, 102, 0.2)";
          ctx.beginPath();
          ctx.ellipse(nx, ny + 50, 32, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // NPC body
          ctx.fillStyle = lv.npc.shirt;
          ctx.beginPath();
          ctx.roundRect(nx - 14, ny + 14, 28, 28, 8);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
          // Legs
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(nx - 10, ny + 40, 7, 12);
          ctx.fillRect(nx + 3, ny + 40, 7, 12);
          // Head
          ctx.fillStyle = "#fde68a";
          ctx.beginPath();
          ctx.arc(nx, ny + 4, 12, 0, Math.PI * 2);
          ctx.fill();
          // Status marker above NPC
          const markY = ny - 24 + Math.sin(elapsed * 5) * 4;
          ctx.fillStyle = allFound ? "#22c55e" : "#facc15";
          ctx.beginPath();
          ctx.roundRect(nx - 22, markY - 12, 44, 24, 9);
          ctx.fill();
          ctx.fillStyle = "#0f172a";
          ctx.font = "900 13px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(allFound ? "✓ GO!" : `${collectedSet.size}/3 🔍`, nx, markY);

          // NPC Name
          const npcName = pState.locale === "ro" ? lv.npc.nameRo : lv.npc.nameRu;
          ctx.fillStyle = "#f8fafc";
          ctx.font = "800 12px system-ui, sans-serif";
          ctx.fillText(npcName, nx, ny - 44);
        }

        // Player Detective Character
        const blinkSkip = player.invuln > 0 && Math.floor(elapsed * 16) % 2 === 0;
        if (!blinkSkip) {
          ctx.save();
          ctx.translate(player.x + PLAYER_W / 2, player.y + PLAYER_H / 2);
          ctx.scale(player.facing, 1);

          const legSwing = player.grounded ? Math.sin(player.runPhase) * 5 : 4;
          // Boots
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(-9 + legSwing, 10, 7, 9);
          ctx.fillRect(2 - legSwing, 10, 7, 9);

          // Cyber-detective jacket
          ctx.fillStyle = "#00d9ff";
          ctx.beginPath();
          ctx.roundRect(-11, -6, 22, 19, 6);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Head
          ctx.fillStyle = "#fde68a";
          ctx.beginPath();
          ctx.arc(0, -12, 9, 0, Math.PI * 2);
          ctx.fill();
          // Eye
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(3, -14, 3, 3);
          // Detective cap + visor
          ctx.fillStyle = "#1d4ed8";
          ctx.beginPath();
          ctx.arc(0, -15, 9, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(2, -16, 10, 3);

          // Mini magnifying glass held in front
          ctx.strokeStyle = "#ffd166";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(14, 0, 4.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Golden Clue Radar Arrow (active when hint requested OR after visiting NPC early)
        const showArrow = pState.hintSignal > 0 || pState.radarActive;
        if (showArrow && !player.won) {
          let targetX = lv.npc.x;
          let targetY = lv.npc.y;
          let bestDist = Infinity;
          for (const clue of lv.clues) {
            if (collectedSet.has(clue.id)) continue;
            const d = Math.hypot(clue.x - player.x, clue.y - player.y);
            if (d < bestDist) {
              bestDist = d;
              targetX = clue.x;
              targetY = clue.y;
            }
          }
          const ang = Math.atan2(targetY - (player.y + 18), targetX - (player.x + 14));
          ctx.save();
          ctx.translate(
            player.x + PLAYER_W / 2 + Math.cos(ang) * 34,
            player.y + PLAYER_H / 2 + Math.sin(ang) * 34,
          );
          ctx.rotate(ang);
          ctx.fillStyle = "#ffd166";
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(-6, -6);
          ctx.lineTo(-3, 0);
          ctx.lineTo(-6, 6);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }

        // Particles
        for (const ptc of particles) {
          ctx.save();
          ctx.globalAlpha = clamp(ptc.life * 1.8, 0, 1);
          ctx.fillStyle = ptc.color;
          ctx.fillRect(ptc.x, ptc.y, ptc.size, ptc.size);
          ctx.restore();
        }

        // Floating messages
        for (const f of floats) {
          ctx.save();
          ctx.globalAlpha = clamp(f.life, 0, 1);
          ctx.font = "900 15px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "#020617";
          ctx.fillText(f.text, f.x + 1, f.y + 1);
          ctx.fillStyle = f.color;
          ctx.fillText(f.text, f.x, f.y);
          ctx.restore();
        }

        ctx.restore(); // end world camera
        ctx.restore(); // end DPR
      }

      rafId = window.requestAnimationFrame(step);
    }

    rafId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [missionId]);

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

      {/* Side-Scrolling 2D Platformer Canvas */}
      <div
        ref={containerRef}
        className="relative h-[320px] w-full overflow-hidden rounded-2xl border-2 border-neon/35 bg-slate-950 sm:h-[380px]"
      >
        <canvas
          ref={canvasRef}
          className="block size-full touch-none select-none"
          aria-label={locale === "ro" ? level.titleRo : level.titleRu}
        />

        {/* Big Overlay CTA when Detective reaches NPC with all 3 clues */}
        {reachedNpcReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <div className="max-w-md rounded-3xl border-2 border-success/80 bg-slate-950/95 p-6 text-center shadow-[0_0_40px_rgba(34,197,94,0.35)]">
              <p className="font-display text-xl font-black text-success">{pt.reachedNpcTitle}</p>
              <div className="mt-3 flex justify-center gap-2">
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

      {/* Touch & Mouse Controls (great on phones, tablets, and interactive whiteboards!) */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onPointerDown={() => {
              controlsRef.current.left = true;
            }}
            onPointerUp={() => {
              controlsRef.current.left = false;
            }}
            onPointerLeave={() => {
              controlsRef.current.left = false;
            }}
            onPointerCancel={() => {
              controlsRef.current.left = false;
            }}
            aria-label="Left"
            className="focus-ring grid size-14 select-none touch-none place-items-center rounded-2xl border-2 border-neon/45 bg-slate-900 text-neon active:bg-neon active:text-slate-950"
          >
            <ArrowLeft className="size-7" aria-hidden="true" />
          </button>
          <button
            type="button"
            onPointerDown={() => {
              controlsRef.current.right = true;
            }}
            onPointerUp={() => {
              controlsRef.current.right = false;
            }}
            onPointerLeave={() => {
              controlsRef.current.right = false;
            }}
            onPointerCancel={() => {
              controlsRef.current.right = false;
            }}
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
