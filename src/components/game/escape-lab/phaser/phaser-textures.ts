import type Phaser from "phaser";

import { MISSION_NPCS, type TrafficCar } from "../city-map-data";

function hexNum(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16);
}

/**
 * Generates crisp retro procedural textures once per Phaser Game instance
 * so we never rely on external image loads or risk broken sprite paths.
 */
export function ensureEscapePhaserTextures(scene: Phaser.Scene, sampleCars?: readonly TrafficCar[]) {
  const tex = scene.textures;

  // 1. Glowing particle spark
  if (!tex.exists("spark")) {
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(6, 6, 5);
    g.generateTexture("spark", 12, 12);
    g.destroy();
  }

  // 2. Golden collectible street star
  if (!tex.exists("star-gold")) {
    const g = scene.add.graphics();
    g.fillStyle(0xffd166, 0.28);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0xffd166, 1);
    g.lineStyle(1.5, 0xfffbeb, 1);
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? 11 : 5;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      pts.push({ x: 16 + Math.cos(a) * r, y: 16 + Math.sin(a) * r });
    }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    g.generateTexture("star-gold", 32, 32);
    g.destroy();
  }

  // 3. Compass pointer arrow
  if (!tex.exists("compass-arrow")) {
    const g = scene.add.graphics();
    g.fillStyle(0xffd166, 1);
    g.lineStyle(2, 0x0f172a, 1);
    g.fillTriangle(20, 9, 2, 2, 2, 16);
    g.strokeTriangle(20, 9, 2, 2, 2, 16);
    g.generateTexture("compass-arrow", 22, 18);
    g.destroy();
  }

  // 4. Top-down Retro GTA Detective (facing right at angle 0)
  if (!tex.exists("detective-top")) {
    const g = scene.add.graphics();
    // Outer cyber ring
    g.lineStyle(2, 0x00d9ff, 0.9);
    g.strokeCircle(20, 20, 17);
    // Backpack
    g.fillStyle(0x1d4ed8, 1);
    g.fillRoundedRect(7, 13, 8, 14, 3);
    // Shoulders / Cyan Cyber Jacket
    g.fillStyle(0x00d9ff, 1);
    g.lineStyle(1.5, 0xffffff, 1);
    g.fillEllipse(20, 20, 18, 24);
    g.strokeEllipse(20, 20, 18, 24);
    // Head + Detective Cap Visor pointing right
    g.fillStyle(0xfde68a, 1);
    g.fillCircle(22, 20, 7);
    g.fillStyle(0x0284c7, 1);
    g.fillCircle(19, 20, 6.5);
    g.fillStyle(0x38bdf8, 1);
    g.fillRect(23, 16, 6, 8);
    g.generateTexture("detective-top", 40, 40);
    g.destroy();
  }

  // 5. Side-scrolling Detective (facing right)
  if (!tex.exists("detective-side")) {
    const g = scene.add.graphics();
    // Boots
    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(7, 31, 7, 9, 2);
    g.fillRoundedRect(17, 31, 7, 9, 2);
    // Trenchcoat / Cyber Jacket
    g.fillStyle(0x00d9ff, 1);
    g.lineStyle(1.5, 0xffffff, 1);
    g.fillRoundedRect(6, 15, 19, 18, 5);
    g.strokeRoundedRect(6, 15, 19, 18, 5);
    // Head
    g.fillStyle(0xfde68a, 1);
    g.fillCircle(16, 10, 8.5);
    // Eye
    g.fillStyle(0x0f172a, 1);
    g.fillRect(19, 8, 3, 3);
    // Cap + visor
    g.fillStyle(0x1d4ed8, 1);
    g.fillRoundedRect(7, 2, 18, 6, 3);
    g.fillStyle(0x38bdf8, 1);
    g.fillRect(17, 5, 11, 3);
    // Mini magnifying glass
    g.lineStyle(2, 0xffd166, 1);
    g.strokeCircle(29, 21, 4);
    g.generateTexture("detective-side", 36, 42);
    g.destroy();
  }

  // 6. Patrol Virus Bot (side-scroller)
  if (!tex.exists("bot-virus")) {
    const g = scene.add.graphics();
    // Antenna
    g.lineStyle(2, 0xfda4af, 1);
    g.lineBetween(16, 8, 16, 2);
    g.fillStyle(0xfacc15, 1);
    g.fillCircle(16, 3, 2.5);
    // Body
    g.fillStyle(0xe11d48, 1);
    g.lineStyle(2, 0xfda4af, 1);
    g.fillRoundedRect(2, 8, 28, 20, 6);
    g.strokeRoundedRect(2, 8, 28, 20, 6);
    // Glowing Visor Eyes
    g.fillStyle(0xfef08a, 1);
    g.fillRect(16, 13, 9, 5);
    g.generateTexture("bot-virus", 32, 30);
    g.destroy();
  }

  // 7. Bounce Spring Pad
  if (!tex.exists("spring-pad")) {
    const g = scene.add.graphics();
    g.fillStyle(0x475569, 1);
    g.fillRect(6, 8, 32, 8);
    g.fillStyle(0xfacc15, 1);
    g.fillRoundedRect(0, 0, 44, 9, 4);
    g.lineStyle(1.5, 0x0f172a, 1);
    g.strokeRoundedRect(0, 0, 44, 9, 4);
    g.generateTexture("spring-pad", 44, 16);
    g.destroy();
  }

  // 8. Checkpoint Flags
  for (const [key, flagColor] of [
    ["flag-idle", 0x64748b],
    ["flag-done", 0x22c55e],
  ] as const) {
    if (!tex.exists(key)) {
      const g = scene.add.graphics();
      g.fillStyle(0xcbd5e1, 1);
      g.fillRect(2, 0, 5, 52);
      g.fillStyle(flagColor, 1);
      g.fillTriangle(7, 2, 36, 13, 7, 24);
      g.generateTexture(key, 38, 52);
      g.destroy();
    }
  }

  // 9. Mission NPC sprites (both top-down and side-view)
  for (const npc of MISSION_NPCS) {
    const topKey = `npc-top-${npc.missionId}`;
    if (!tex.exists(topKey)) {
      const g = scene.add.graphics();
      g.fillStyle(0x000000, 0.35);
      g.fillEllipse(18, 24, 24, 14);
      g.fillStyle(hexNum(npc.shirt), 1);
      g.lineStyle(1.5, 0xffffff, 1);
      g.fillEllipse(18, 18, 26, 18);
      g.strokeEllipse(18, 18, 26, 18);
      g.fillStyle(0xfde68a, 1);
      g.fillCircle(18, 16, 7.5);
      g.fillStyle(npc.missionId === 4 ? 0x1e1b4b : 0x334155, 1);
      g.fillCircle(18, 13, 5.5);
      g.generateTexture(topKey, 36, 36);
      g.destroy();
    }

    const sideKey = `npc-side-${npc.missionId}`;
    if (!tex.exists(sideKey)) {
      const g = scene.add.graphics();
      g.fillStyle(0x1e293b, 1);
      g.fillRect(8, 38, 7, 12);
      g.fillRect(19, 38, 7, 12);
      g.fillStyle(hexNum(npc.shirt), 1);
      g.lineStyle(2, 0xffffff, 1);
      g.fillRoundedRect(4, 16, 26, 24, 7);
      g.strokeRoundedRect(4, 16, 26, 24, 7);
      g.fillStyle(0xfde68a, 1);
      g.fillCircle(17, 10, 10);
      g.fillStyle(npc.missionId === 4 ? 0x1e1b4b : 0x334155, 1);
      g.fillRoundedRect(8, 1, 18, 5, 2);
      g.generateTexture(sideKey, 34, 52);
      g.destroy();
    }
  }

  // 10. Retro Traffic Car Textures
  if (sampleCars) {
    sampleCars.forEach((car, idx) => {
      const key = `traffic-car-${idx}`;
      if (tex.exists(key)) return;
      const g = scene.add.graphics();
      const w = car.w;
      const h = car.h;
      g.fillStyle(hexNum(car.color), 1);
      g.lineStyle(1.5, 0xffffff, 0.55);
      g.fillRoundedRect(2, 2, w, h, 6);
      g.strokeRoundedRect(2, 2, w, h, 6);

      // Windshield / Roof
      g.fillStyle(0x0f172a, 1);
      if (car.axis === "h") {
        g.fillRect(2 + w / 2 - 10, 6, 20, h - 8);
        const frontX = car.dir === 1 ? 2 + w - 2 : 0;
        const rearX = car.dir === 1 ? 2 : 2 + w - 4;
        g.fillStyle(0xfef08a, 1);
        g.fillRect(frontX, 5, 4, 5);
        g.fillRect(frontX, h - 6, 4, 5);
        g.fillStyle(0xef4444, 1);
        g.fillRect(rearX, 5, 3, 5);
        g.fillRect(rearX, h - 6, 3, 5);
      } else {
        g.fillRect(6, 2 + h / 2 - 10, w - 8, 20);
        const frontY = car.dir === 1 ? 2 + h - 2 : 0;
        const rearY = car.dir === 1 ? 2 : 2 + h - 4;
        g.fillStyle(0xfef08a, 1);
        g.fillRect(5, frontY, 5, 4);
        g.fillRect(w - 6, frontY, 5, 4);
        g.fillStyle(0xef4444, 1);
        g.fillRect(5, rearY, 5, 3);
        g.fillRect(w - 6, rearY, 5, 3);
      }

      g.generateTexture(key, w + 4, h + 4);
      g.destroy();
    });
  }
}
