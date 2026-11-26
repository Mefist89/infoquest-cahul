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
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { playSound } from "@/features/sound/play-sound";
import {
  CITY_BUILDINGS,
  MISSION_NPCS,
  PARK_TREES,
  STREET_STARS,
  WORLD_H,
  WORLD_W,
  createInitialCars,
  hitsBuilding,
  type MissionId,
  type MissionNpc,
} from "./city-map-data";
import { escapeLabCopy, type EscapeLocale } from "./escape-lab-copy";

type FloatingText = {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
};

type WalkTarget = {
  x: number;
  y: number;
  pulse: number;
};

const PLAYER_RADIUS = 14;
const PLAYER_SPEED = 205;
const NPC_INTERACT_DIST = 82;
const STAR_COLLECT_DIST = 30;
const FOUNTAIN_X = 630;
const FOUNTAIN_Y = 425;
const FOUNTAIN_RADIUS = 32;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function hitsWorldObstacle(x: number, y: number, radius: number) {
  if (hitsBuilding(x, y, radius)) return true;
  const dx = x - FOUNTAIN_X;
  const dy = y - FOUNTAIN_Y;
  return dx * dx + dy * dy < (FOUNTAIN_RADIUS + radius) * (FOUNTAIN_RADIUS + radius);
}

function drawStarShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  angle: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = angle + (i * Math.PI) / 5 - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const playerRef = useRef({
    x: initialPlayerPos.x,
    y: initialPlayerPos.y,
    angle: -Math.PI / 2,
    walkPhase: 0,
    bumpFlash: 0,
    bumpCooldown: 0,
  });
  const keysRef = useRef<Set<string>>(new Set());
  const dpadRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const targetRef = useRef<WalkTarget | null>(null);
  const carsRef = useRef(createInitialCars());
  const floatsRef = useRef<FloatingText[]>([]);
  const cameraRef = useRef({ x: 0, y: 0, viewW: 800, viewH: 520 });

  const [nearbyNpc, setNearbyNpc] = useState<MissionNpc | null>(null);
  const nearbyNpcIdRef = useRef<MissionId | null>(null);

  // Keep latest props in refs so the RAF loop never restarts unnecessarily.
  const stateRef = useRef({
    locale,
    completedMissions,
    collectedStars,
    bossUnlocked,
    onPlayerMove,
    onCollectStar,
    onStartMission,
    onBossLockedHit,
  });
  useEffect(() => {
    stateRef.current = {
      locale,
      completedMissions,
      collectedStars,
      bossUnlocked,
      onPlayerMove,
      onCollectStar,
      onStartMission,
      onBossLockedHit,
    };
  }, [
    locale,
    completedMissions,
    collectedStars,
    bossUnlocked,
    onPlayerMove,
    onCollectStar,
    onStartMission,
    onBossLockedHit,
  ]);

  function tryTriggerNpc(npc: MissionNpc) {
    const s = stateRef.current;
    if (npc.missionId === 4 && !s.bossUnlocked) {
      playSound("wrong");
      s.onBossLockedHit();
      return;
    }
    playSound("correct");
    s.onPlayerMove({ x: playerRef.current.x, y: playerRef.current.y });
    s.onStartMission(npc.missionId);
  }

  function guideToNpc(npc: MissionNpc) {
    // Walk right in front of the selected character.
    const offsetY = npc.y < 400 ? 22 : -22;
    targetRef.current = {
      x: npc.x,
      y: npc.y + offsetY,
      pulse: 0,
    };
    playSound("correct");
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const code = e.code;
      const isMove =
        code === "KeyW" ||
        code === "KeyA" ||
        code === "KeyS" ||
        code === "KeyD" ||
        code === "ArrowUp" ||
        code === "ArrowDown" ||
        code === "ArrowLeft" ||
        code === "ArrowRight";

      if (isMove) {
        if (code.startsWith("Arrow")) e.preventDefault();
        keysRef.current.add(code);
        targetRef.current = null;
        return;
      }

      if (code === "KeyE" || code === "Space" || code === "Enter") {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "BUTTON" || tag === "A" || tag === "INPUT") return;
        const activeId = nearbyNpcIdRef.current;
        if (activeId !== null) {
          e.preventDefault();
          const npc = MISSION_NPCS.find((n) => n.missionId === activeId);
          if (npc) {
            const s = stateRef.current;
            if (npc.missionId === 4 && !s.bossUnlocked) {
              playSound("wrong");
              s.onBossLockedHit();
            } else {
              playSound("correct");
              s.onPlayerMove({ x: playerRef.current.x, y: playerRef.current.y });
              s.onStartMission(npc.missionId);
            }
          }
        }
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.code);
    }

    function handleBlur() {
      keysRef.current.clear();
      dpadRef.current = { dx: 0, dy: 0 };
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    function resize() {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(340, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      cameraRef.current.viewW = w;
      cameraRef.current.viewH = h;
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    function step(now: number) {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      elapsed += dt;

      const s = stateRef.current;
      const p = playerRef.current;
      const keys = keysRef.current;

      // 1. Movement input (keyboard + mobile D-pad + tap-to-walk)
      let ix = dpadRef.current.dx;
      let iy = dpadRef.current.dy;
      if (keys.has("KeyW") || keys.has("ArrowUp")) iy -= 1;
      if (keys.has("KeyS") || keys.has("ArrowDown")) iy += 1;
      if (keys.has("KeyA") || keys.has("ArrowLeft")) ix -= 1;
      if (keys.has("KeyD") || keys.has("ArrowRight")) ix += 1;

      if (ix !== 0 || iy !== 0) {
        targetRef.current = null;
      } else if (targetRef.current) {
        const dx = targetRef.current.x - p.x;
        const dy = targetRef.current.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 10) {
          targetRef.current = null;
        } else {
          ix = dx / dist;
          iy = dy / dist;
          targetRef.current.pulse += dt * 4;
        }
      }

      const mag = Math.hypot(ix, iy);
      if (mag > 0.01) {
        const vx = (ix / mag) * PLAYER_SPEED * dt;
        const vy = (iy / mag) * PLAYER_SPEED * dt;
        const nextX = p.x + vx;
        const nextY = p.y + vy;

        let moved = false;
        if (!hitsWorldObstacle(nextX, p.y, PLAYER_RADIUS)) {
          p.x = nextX;
          moved = true;
        }
        if (!hitsWorldObstacle(p.x, nextY, PLAYER_RADIUS)) {
          p.y = nextY;
          moved = true;
        }
        if (moved) {
          p.angle = Math.atan2(iy, ix);
          p.walkPhase += dt * 11;
        } else {
          targetRef.current = null;
        }
      }

      if (p.bumpFlash > 0) p.bumpFlash = Math.max(0, p.bumpFlash - dt * 2.5);
      if (p.bumpCooldown > 0) p.bumpCooldown = Math.max(0, p.bumpCooldown - dt);

      // 2. Update moving retro traffic cars + gentle player bump
      for (const car of carsRef.current) {
        if (car.axis === "h") {
          car.x += car.dir * car.speed * dt;
          if (car.dir === 1 && car.x > WORLD_W + 60) car.x = -60;
          if (car.dir === -1 && car.x < -60) car.x = WORLD_W + 60;
        } else {
          car.y += car.dir * car.speed * dt;
          if (car.dir === 1 && car.y > WORLD_H + 60) car.y = -60;
          if (car.dir === -1 && car.y < -60) car.y = WORLD_H + 60;
        }

        const halfW = car.w / 2 + PLAYER_RADIUS - 3;
        const halfH = car.h / 2 + PLAYER_RADIUS - 3;
        if (Math.abs(p.x - car.x) < halfW && Math.abs(p.y - car.y) < halfH) {
          // Push player perpendicular to car lane so they hop safely to the curb
          const pushX = car.axis === "v" ? (p.x >= car.x ? 26 : -26) : 0;
          const pushY = car.axis === "h" ? (p.y >= car.y ? 26 : -26) : 0;
          if (!hitsWorldObstacle(p.x + pushX, p.y + pushY, PLAYER_RADIUS)) {
            p.x += pushX;
            p.y += pushY;
          }
          if (p.bumpCooldown <= 0) {
            p.bumpFlash = 1;
            p.bumpCooldown = 0.65;
            targetRef.current = null;
            playSound("wrong");
            floatsRef.current.push({
              x: p.x,
              y: p.y - 22,
              text: s.locale === "ro" ? "Atenție!" : "Осторожно!",
              color: "#fb7185",
              life: 1,
            });
          }
        }
      }

      // 3. Collect street stars
      for (const star of STREET_STARS) {
        if (s.collectedStars.has(star.id)) continue;
        if (Math.hypot(p.x - star.x, p.y - star.y) < STAR_COLLECT_DIST) {
          s.onCollectStar(star.id);
          playSound("correct");
          floatsRef.current.push({
            x: star.x,
            y: star.y - 10,
            text: "+1 ★",
            color: "#ffd166",
            life: 1.15,
          });
        }
      }

      // 4. Floating text animations
      floatsRef.current = floatsRef.current
        .map((f) => ({ ...f, y: f.y - dt * 36, life: f.life - dt }))
        .filter((f) => f.life > 0);

      // 5. Check proximity to mission NPCs
      let closestNpc: MissionNpc | null = null;
      let closestDist = NPC_INTERACT_DIST;
      for (const npc of MISSION_NPCS) {
        const d = Math.hypot(p.x - npc.x, p.y - npc.y);
        if (d < closestDist) {
          closestDist = d;
          closestNpc = npc;
        }
      }
      const nextId = closestNpc ? closestNpc.missionId : null;
      if (nextId !== nearbyNpcIdRef.current) {
        nearbyNpcIdRef.current = nextId;
        setNearbyNpc(closestNpc);
      }

      // 6. Camera positioning
      const cam = cameraRef.current;
      const targetCamX =
        cam.viewW >= WORLD_W
          ? -(cam.viewW - WORLD_W) / 2
          : clamp(p.x - cam.viewW / 2, 0, WORLD_W - cam.viewW);
      const targetCamY =
        cam.viewH >= WORLD_H
          ? -(cam.viewH - WORLD_H) / 2
          : clamp(p.y - cam.viewH / 2, 0, WORLD_H - cam.viewH);
      cam.x += (targetCamX - cam.x) * Math.min(1, dt * 10);
      cam.y += (targetCamY - cam.y) * Math.min(1, dt * 10);

      // 7. Render frame
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        const dpr = canvas.width / cam.viewW;
        ctx.save();
        ctx.scale(dpr, dpr);

        // Background void
        ctx.fillStyle = "#080f1f";
        ctx.fillRect(0, 0, cam.viewW, cam.viewH);

        ctx.save();
        ctx.translate(-cam.x, -cam.y);

        // Sidewalk base + retro tile grid
        ctx.fillStyle = "#1b2438";
        ctx.fillRect(0, 0, WORLD_W, WORLD_H);

        ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= WORLD_W; gx += 32) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, WORLD_H);
          ctx.stroke();
        }
        for (let gy = 0; gy <= WORLD_H; gy += 32) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(WORLD_W, gy);
          ctx.stroke();
        }

        // Central Cyber Park grass + paths + animated neon fountain
        ctx.fillStyle = "#0e3a2d";
        ctx.fillRect(454, 330, 358, 198);
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2;
        ctx.strokeRect(454, 330, 358, 198);

        // Park stone cross paths
        ctx.fillStyle = "#26334d";
        ctx.fillRect(606, 330, 48, 198);
        ctx.fillRect(454, 405, 358, 40);

        // Central fountain
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(FOUNTAIN_X, FOUNTAIN_Y, FOUNTAIN_RADIUS + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(FOUNTAIN_X, FOUNTAIN_Y, FOUNTAIN_RADIUS - 2, 0, Math.PI * 2);
        ctx.fill();
        const rippleR = 8 + ((elapsed * 18) % 20);
        ctx.strokeStyle = "rgba(125, 211, 252, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(FOUNTAIN_X, FOUNTAIN_Y, rippleR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.arc(FOUNTAIN_X, FOUNTAIN_Y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Roads (2 horizontal avenues + 2 vertical avenues)
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 246, WORLD_W, 76);
        ctx.fillRect(0, 536, WORLD_W, 76);
        ctx.fillRect(370, 0, 76, WORLD_H);
        ctx.fillRect(820, 0, 76, WORLD_H);

        // Curb edges
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        for (const ry of [246, 322, 536, 612]) {
          ctx.beginPath();
          ctx.moveTo(0, ry);
          ctx.lineTo(WORLD_W, ry);
          ctx.stroke();
        }
        for (const rx of [370, 446, 820, 896]) {
          ctx.beginPath();
          ctx.moveTo(rx, 0);
          ctx.lineTo(rx, WORLD_H);
          ctx.stroke();
        }

        // Yellow dashed center lane lines
        ctx.save();
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 3;
        ctx.setLineDash([18, 16]);
        for (const cy of [284, 574]) {
          ctx.beginPath();
          ctx.moveTo(0, cy);
          ctx.lineTo(WORLD_W, cy);
          ctx.stroke();
        }
        for (const cx of [408, 858]) {
          ctx.beginPath();
          ctx.moveTo(cx, 0);
          ctx.lineTo(cx, WORLD_H);
          ctx.stroke();
        }
        ctx.restore();

        // Zebra crosswalks near intersections
        ctx.fillStyle = "rgba(226, 232, 240, 0.72)";
        const intersections: [number, number][] = [
          [370, 246],
          [820, 246],
          [370, 536],
          [820, 536],
        ];
        for (const [ix0, iy0] of intersections) {
          for (let stripe = 0; stripe < 5; stripe += 1) {
            const offset = 8 + stripe * 14;
            ctx.fillRect(ix0 - 16, iy0 + offset, 12, 7);
            ctx.fillRect(ix0 + 80, iy0 + offset, 12, 7);
            ctx.fillRect(ix0 + offset, iy0 - 16, 7, 12);
            ctx.fillRect(ix0 + offset, iy0 + 80, 7, 12);
          }
        }

        // Tap-to-walk target ripple on ground
        if (targetRef.current) {
          const r = 10 + Math.sin(targetRef.current.pulse) * 4;
          ctx.strokeStyle = "#00d9ff";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(targetRef.current.x, targetRef.current.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Collectible street stars
        for (const star of STREET_STARS) {
          if (s.collectedStars.has(star.id)) continue;
          const bob = Math.sin(elapsed * 4 + star.x) * 3;
          ctx.save();
          ctx.fillStyle = "rgba(255, 209, 102, 0.22)";
          ctx.beginPath();
          ctx.arc(star.x, star.y + bob, 16, 0, Math.PI * 2);
          ctx.fill();
          drawStarShape(ctx, star.x, star.y + bob, 11, 5, elapsed * 2);
          ctx.fillStyle = "#ffd166";
          ctx.fill();
          ctx.strokeStyle = "#fffbeb";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }

        // Retro Traffic Cars
        for (const car of carsRef.current) {
          ctx.save();
          ctx.translate(car.x, car.y);
          // Ground shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
          ctx.fillRect(-car.w / 2 + 3, -car.h / 2 + 4, car.w, car.h);

          // Chassis
          ctx.fillStyle = car.color;
          ctx.beginPath();
          ctx.roundRect(-car.w / 2, -car.h / 2, car.w, car.h, 6);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.45)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Roof + windshield
          ctx.fillStyle = "#0f172a";
          if (car.axis === "h") {
            ctx.fillRect(-10, -car.h / 2 + 4, 20, car.h - 8);
            // Headlights
            const frontX = car.dir === 1 ? car.w / 2 : -car.w / 2 - 4;
            const rearX = car.dir === 1 ? -car.w / 2 : car.w / 2 - 3;
            ctx.fillStyle = "#fef08a";
            ctx.fillRect(frontX, -car.h / 2 + 3, 4, 5);
            ctx.fillRect(frontX, car.h / 2 - 8, 4, 5);
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(rearX, -car.h / 2 + 3, 3, 5);
            ctx.fillRect(rearX, car.h / 2 - 8, 3, 5);
          } else {
            ctx.fillRect(-car.w / 2 + 4, -10, car.w - 8, 20);
            const frontY = car.dir === 1 ? car.h / 2 : -car.h / 2 - 4;
            const rearY = car.dir === 1 ? -car.h / 2 : car.h / 2 - 3;
            ctx.fillStyle = "#fef08a";
            ctx.fillRect(-car.w / 2 + 3, frontY, 5, 4);
            ctx.fillRect(car.w / 2 - 8, frontY, 5, 4);
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(-car.w / 2 + 3, rearY, 5, 3);
            ctx.fillRect(car.w / 2 - 8, rearY, 5, 3);
          }
          ctx.restore();
        }

        // Mission NPC Characters
        for (const npc of MISSION_NPCS) {
          const isDone = s.completedMissions.has(npc.missionId);
          const isLocked = npc.missionId === 4 && !s.bossUnlocked;
          const pulse = 1 + Math.sin(elapsed * 4.5 + npc.missionId) * 0.14;
          const ringColor = isDone
            ? "#22c55e"
            : isLocked
              ? "#fb7185"
              : npc.color;

          // Sidewalk interaction halo ring
          ctx.save();
          ctx.strokeStyle = ringColor;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.7;
          if (isLocked) ctx.setLineDash([6, 5]);
          ctx.beginPath();
          ctx.arc(npc.x, npc.y, 26 * pulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Ground shadow
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.beginPath();
          ctx.ellipse(npc.x, npc.y + 8, 13, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Top-down shoulders / jacket
          ctx.fillStyle = npc.shirt;
          ctx.beginPath();
          ctx.ellipse(npc.x, npc.y, 13, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Top-down head
          ctx.fillStyle = "#fde68a";
          ctx.beginPath();
          ctx.arc(npc.x, npc.y - 2, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = npc.missionId === 4 ? "#1e1b4b" : "#334155";
          ctx.beginPath();
          ctx.arc(npc.x, npc.y - 4, 6.5, Math.PI, Math.PI * 2);
          ctx.fill();

          // Floating mission marker badge above NPC
          const badgeY = npc.y - 32 + Math.sin(elapsed * 5 + npc.missionId) * 3;
          ctx.fillStyle = isDone ? "#16a34a" : isLocked ? "#be123c" : "#facc15";
          ctx.beginPath();
          ctx.roundRect(npc.x - 13, badgeY - 12, 26, 22, 8);
          ctx.fill();
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = isDone || isLocked ? "#ffffff" : "#0f172a";
          ctx.font = "900 14px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(isDone ? "✓" : isLocked ? "🔒" : "!", npc.x, badgeY - 1);

          // Character Name Pill
          const npcName = s.locale === "ro" ? npc.nameRo : npc.nameRu;
          ctx.font = "800 12px system-ui, sans-serif";
          const labelW = ctx.measureText(npcName).width + 14;
          ctx.fillStyle = "rgba(9, 15, 32, 0.88)";
          ctx.beginPath();
          ctx.roundRect(npc.x - labelW / 2, npc.y + 15, labelW, 20, 6);
          ctx.fill();
          ctx.strokeStyle = ringColor;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.fillStyle = "#f8fafc";
          ctx.fillText(npcName, npc.x, npc.y + 25);
        }

        // Player Character (Top-Down Retro Detective)
        ctx.save();
        ctx.translate(p.x, p.y);

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath();
        ctx.ellipse(0, 7, 13, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Neon ring around player
        ctx.strokeStyle = p.bumpFlash > 0 ? "#fb7185" : "#00d9ff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.rotate(p.angle);
        const swing = Math.sin(p.walkPhase) * 4;

        // Swinging feet
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(swing, -6, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.ellipse(-swing, 6, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Backpack
        ctx.fillStyle = "#1d4ed8";
        ctx.beginPath();
        ctx.roundRect(-12, -7, 7, 14, 3);
        ctx.fill();

        // Shoulders / Cyan Cyber Jacket
        ctx.fillStyle = p.bumpFlash > 0 ? "#fb7185" : "#00d9ff";
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head + Cap visor pointing forward
        ctx.fillStyle = "#fde68a";
        ctx.beginPath();
        ctx.arc(2, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(0, 0, 6.8, Math.PI * 0.5, Math.PI * 1.5);
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(4, -4, 5, 8);
        ctx.restore();

        // Orbiting Compass Arrow pointing to nearest unfinished unlocked mission
        const targetMission = MISSION_NPCS.find((npc) => {
          if (s.completedMissions.has(npc.missionId)) return false;
          if (npc.missionId === 4 && !s.bossUnlocked) return false;
          return true;
        });
        if (targetMission) {
          // Prefer nearest among available unfinished missions
          let bestNpc = targetMission;
          let bestD = Infinity;
          for (const npc of MISSION_NPCS) {
            if (s.completedMissions.has(npc.missionId)) continue;
            if (npc.missionId === 4 && !s.bossUnlocked) continue;
            const d = Math.hypot(npc.x - p.x, npc.y - p.y);
            if (d < bestD) {
              bestD = d;
              bestNpc = npc;
            }
          }
          if (bestD > 95) {
            const ang = Math.atan2(bestNpc.y - p.y, bestNpc.x - p.x);
            ctx.save();
            ctx.translate(p.x + Math.cos(ang) * 34, p.y + Math.sin(ang) * 34);
            ctx.rotate(ang);
            ctx.fillStyle = bestNpc.missionId === 4 ? "#fb7185" : "#ffd166";
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
        }

        // Retro 3D-Offset Buildings (drawn after player so rooftops feel tall like GTA 1/2!)
        const camCenterX = cam.x + cam.viewW / 2;
        const camCenterY = cam.y + cam.viewH / 2;
        for (const b of CITY_BUILDINGS) {
          const cx = b.x + b.w / 2;
          const cy = b.y + b.h / 2;
          const offX = clamp((cx - camCenterX) * 0.045, -14, 14);
          const offY = clamp((cy - camCenterY) * 0.045, -14, 14);
          const rx = b.x + offX;
          const ry = b.y + offY;

          // Base footprint + 3D wall extrusion
          ctx.fillStyle = b.wallColor;
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(rx, ry);
          ctx.lineTo(rx + b.w, ry);
          ctx.lineTo(b.x + b.w, b.y);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(b.x, b.y + b.h);
          ctx.lineTo(rx, ry + b.h);
          ctx.lineTo(rx + b.w, ry + b.h);
          ctx.lineTo(b.x + b.w, b.y + b.h);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(rx, ry);
          ctx.lineTo(rx, ry + b.h);
          ctx.lineTo(b.x, b.y + b.h);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(b.x + b.w, b.y);
          ctx.lineTo(rx + b.w, ry);
          ctx.lineTo(rx + b.w, ry + b.h);
          ctx.lineTo(b.x + b.w, b.y + b.h);
          ctx.closePath();
          ctx.fill();

          const missionDone = b.missionId ? s.completedMissions.has(b.missionId) : false;
          const bossLocked = b.missionId === 4 && !s.bossUnlocked;

          // Rooftop
          ctx.fillStyle = b.roofColor;
          ctx.fillRect(rx, ry, b.w, b.h);

          // Rooftop retro vents/skylight detail
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.fillRect(rx + 16, ry + 16, b.w - 32, b.h - 32);

          // Neon Roof Trim
          ctx.strokeStyle = missionDone ? "#22c55e" : b.trimColor;
          ctx.lineWidth = b.missionId ? 3.5 : 2;
          ctx.strokeRect(rx + 1, ry + 1, b.w - 2, b.h - 2);

          // Pulsing laser shield on Boss HQ while locked
          if (bossLocked) {
            ctx.save();
            ctx.strokeStyle = `rgba(251, 113, 133, ${0.45 + Math.sin(elapsed * 6) * 0.35})`;
            ctx.lineWidth = 4;
            ctx.setLineDash([12, 8]);
            ctx.strokeRect(b.x - 6, b.y - 6, b.w + 12, b.h + 12);
            ctx.restore();
          }

          // Neon Roof Label
          const label = s.locale === "ro" ? b.labelRo : b.labelRu;
          if (label) {
            ctx.font = "900 15px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(2, 6, 23, 0.72)";
            ctx.fillRect(rx + 22, ry + b.h / 2 - 16, b.w - 44, 32);
            ctx.fillStyle = missionDone ? "#4ade80" : b.trimColor;
            ctx.fillText(
              missionDone ? `✓ ${label}` : bossLocked ? `🔒 ${label}` : label,
              rx + b.w / 2,
              ry + b.h / 2,
            );
          }
        }

        // Park & sidewalk trees
        for (const [tx, ty, tr] of PARK_TREES) {
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.beginPath();
          ctx.arc(tx + 4, ty + 5, tr, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#065f46";
          ctx.beginPath();
          ctx.arc(tx, ty, tr, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(tx - tr * 0.22, ty - tr * 0.22, tr * 0.62, 0, Math.PI * 2);
          ctx.fill();
        }

        // Floating feedback texts (+1 ★, etc.)
        for (const f of floatsRef.current) {
          ctx.save();
          ctx.globalAlpha = clamp(f.life, 0, 1);
          ctx.font = "900 16px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "#020617";
          ctx.fillText(f.text, f.x + 1, f.y + 1);
          ctx.fillStyle = f.color;
          ctx.fillText(f.text, f.x, f.y);
          ctx.restore();
        }

        ctx.restore(); // end world transform

        // 8. GTA-Style Top-Right Corner Mini-Map Radar
        const mapW = cam.viewW < 520 ? 116 : 154;
        const mapH = Math.round((mapW * WORLD_H) / WORLD_W);
        const mx = cam.viewW - mapW - 12;
        const my = 12;
        const scaleX = mapW / WORLD_W;
        const scaleY = mapH / WORLD_H;

        ctx.save();
        ctx.fillStyle = "rgba(6, 13, 30, 0.88)";
        ctx.beginPath();
        ctx.roundRect(mx - 4, my - 4, mapW + 8, mapH + 22, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 217, 255, 0.65)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Radar roads
        ctx.fillStyle = "#334155";
        ctx.fillRect(mx, my + 246 * scaleY, mapW, 76 * scaleY);
        ctx.fillRect(mx, my + 536 * scaleY, mapW, 76 * scaleY);
        ctx.fillRect(mx + 370 * scaleX, my, 76 * scaleX, mapH);
        ctx.fillRect(mx + 820 * scaleX, my, 76 * scaleX, mapH);

        // Radar buildings
        for (const b of CITY_BUILDINGS) {
          ctx.fillStyle = b.missionId
            ? s.completedMissions.has(b.missionId)
              ? "#22c55e"
              : b.trimColor
            : "#475569";
          ctx.globalAlpha = b.missionId ? 0.85 : 0.45;
          ctx.fillRect(mx + b.x * scaleX, my + b.y * scaleY, b.w * scaleX, b.h * scaleY);
        }
        ctx.globalAlpha = 1;

        // Radar uncollected street stars
        ctx.fillStyle = "#ffd166";
        for (const star of STREET_STARS) {
          if (s.collectedStars.has(star.id)) continue;
          ctx.fillRect(mx + star.x * scaleX - 1.5, my + star.y * scaleY - 1.5, 3, 3);
        }

        // Radar pulsing mission NPC blips
        for (const npc of MISSION_NPCS) {
          const done = s.completedMissions.has(npc.missionId);
          const locked = npc.missionId === 4 && !s.bossUnlocked;
          ctx.fillStyle = done ? "#4ade80" : locked ? "#fb7185" : "#facc15";
          const r = done ? 3 : 3.8 + Math.sin(elapsed * 6) * 0.9;
          ctx.beginPath();
          ctx.arc(mx + npc.x * scaleX, my + npc.y * scaleY, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Radar player dot
        ctx.fillStyle = "#00d9ff";
        ctx.beginPath();
        ctx.arc(mx + p.x * scaleX, my + p.y * scaleY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Radar label
        ctx.font = "900 11px system-ui, sans-serif";
        ctx.fillStyle = "#7dd3fc";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(escapeLabCopy[s.locale].city.radarTitle, mx + mapW / 2, my + mapH + 10);
        ctx.restore();

        ctx.restore(); // end DPR transform
      }

      rafId = window.requestAnimationFrame(step);
    }

    rafId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  function handleCanvasPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left + cameraRef.current.x;
    const clickY = e.clientY - rect.top + cameraRef.current.y;

    // Check if the player tapped directly on a mission NPC
    for (const npc of MISSION_NPCS) {
      if (Math.hypot(clickX - npc.x, clickY - npc.y) < 44) {
        const playerDist = Math.hypot(playerRef.current.x - npc.x, playerRef.current.y - npc.y);
        if (playerDist <= NPC_INTERACT_DIST + 16) {
          tryTriggerNpc(npc);
          return;
        }
        guideToNpc(npc);
        return;
      }
    }

    // Otherwise walk smoothly to tapped street location
    targetRef.current = {
      x: clamp(clickX, 30, WORLD_W - 30),
      y: clamp(clickY, 30, WORLD_H - 30),
      pulse: 0,
    };
  }

  function setDpad(dx: number, dy: number) {
    dpadRef.current = { dx, dy };
    if (dx !== 0 || dy !== 0) targetRef.current = null;
  }

  const nearbyLocked = nearbyNpc ? nearbyNpc.missionId === 4 && !bossUnlocked : false;
  const nearbyDone = nearbyNpc ? completedMissions.has(nearbyNpc.missionId) : false;

  return (
    <div className="space-y-3">
      {/* Main Retro GTA City Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative h-[400px] w-full overflow-hidden rounded-3xl border-2 border-neon/45 bg-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:h-[500px] lg:h-[540px]"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handleCanvasPointerDown}
          className="block size-full cursor-crosshair touch-none select-none"
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
                onClick={() => tryTriggerNpc(nearbyNpc)}
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
                  onClick={() => guideToNpc(npc)}
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
