import type { MissionId } from "./city-map-data";

export type PlatformRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  style?: "floor" | "shelf" | "neon" | "brick";
};

export type MovingPlatform = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  speed: number;
};

export type BounceSpring = {
  x: number;
  y: number;
  w: number;
};

export type LaserHazard = {
  x: number;
  y: number;
  w: number;
  h: number;
  period: number;
  phaseOffset: number;
};

export type PatrolBot = {
  id: string;
  x: number;
  y: number;
  minX: number;
  maxX: number;
  speed: number;
};

export type LevelClue = {
  id: string;
  x: number;
  y: number;
  emoji: string;
  labelRu: string;
  labelRo: string;
};

export type PlatformerLevel = {
  missionId: MissionId;
  worldW: number;
  worldH: number;
  titleRu: string;
  titleRo: string;
  bgTop: string;
  bgBottom: string;
  accent: string;
  platformFill: string;
  platformTop: string;
  spawn: { x: number; y: number };
  checkpoint: { x: number; y: number };
  npc: {
    x: number;
    y: number;
    nameRu: string;
    nameRo: string;
    shirt: string;
    accent: string;
  };
  platforms: readonly PlatformRect[];
  movingPlatforms: readonly MovingPlatform[];
  springs: readonly BounceSpring[];
  lasers: readonly LaserHazard[];
  bots: readonly PatrolBot[];
  clues: readonly LevelClue[];
};

const WORLD_W = 1920;
const WORLD_H = 480;

export const PLATFORMER_LEVELS: Record<MissionId, PlatformerLevel> = {
  // Mission 1: Cyber Office — bookshelves, desks, springs, UV clues
  1: {
    missionId: 1,
    worldW: WORLD_W,
    worldH: WORLD_H,
    titleRu: "Кибер-Офис · Путь к Наталье",
    titleRo: "Cyber-Birou · Drumul spre Natalia",
    bgTop: "#0f172a",
    bgBottom: "#1e1b4b",
    accent: "#38bdf8",
    platformFill: "#1e293b",
    platformTop: "#38bdf8",
    spawn: { x: 70, y: 360 },
    checkpoint: { x: 960, y: 364 },
    npc: {
      x: 1810,
      y: 364,
      nameRu: "Наталья",
      nameRo: "Natalia",
      shirt: "#7c3aed",
      accent: "#38bdf8",
    },
    platforms: [
      { x: 0, y: 416, w: 460, h: 64, style: "floor" },
      { x: 200, y: 325, w: 140, h: 20, style: "shelf" },
      { x: 350, y: 245, w: 145, h: 20, style: "shelf" },
      { x: 530, y: 416, w: 320, h: 64, style: "floor" },
      { x: 580, y: 315, w: 130, h: 20, style: "shelf" },
      { x: 740, y: 230, w: 150, h: 20, style: "shelf" },
      { x: 910, y: 416, w: 340, h: 64, style: "floor" },
      { x: 1050, y: 310, w: 140, h: 20, style: "shelf" },
      { x: 1280, y: 235, w: 150, h: 20, style: "shelf" },
      { x: 1320, y: 416, w: 230, h: 64, style: "floor" },
      { x: 1480, y: 325, w: 120, h: 20, style: "shelf" },
      { x: 1620, y: 416, w: 300, h: 64, style: "floor" },
    ],
    movingPlatforms: [
      { id: "m1-1", x: 1210, y: 335, w: 105, h: 18, dx: 0, dy: -85, speed: 1.5 },
    ],
    springs: [
      { x: 400, y: 402, w: 44 },
      { x: 1175, y: 402, w: 44 },
    ],
    lasers: [
      { x: 1425, y: 340, w: 12, h: 76, period: 2.6, phaseOffset: 0 },
    ],
    bots: [
      { id: "b1-1", x: 640, y: 392, minX: 550, maxX: 820, speed: 92 },
      { id: "b1-2", x: 1080, y: 392, minX: 980, maxX: 1165, speed: 105 },
    ],
    clues: [
      { id: "c1-1", x: 422, y: 205, emoji: "📝", labelRu: "Записка", labelRo: "Bilețel" },
      { id: "c1-2", x: 815, y: 190, emoji: "🔦", labelRu: "УФ-фонарик", labelRo: "Lanternă UV" },
      { id: "c1-3", x: 1355, y: 195, emoji: "💾", labelRu: "Флешка", labelRo: "Stick USB" },
    ],
  },

  // Mission 2: Server Station — moving lifts, glowing racks, chip clues
  2: {
    missionId: 2,
    worldW: WORLD_W,
    worldH: WORLD_H,
    titleRu: "Серверная · Путь к Офицеру Раду",
    titleRo: "Servere · Drumul spre Ofițer Radu",
    bgTop: "#022c22",
    bgBottom: "#0f172a",
    accent: "#34d399",
    platformFill: "#064e3b",
    platformTop: "#34d399",
    spawn: { x: 70, y: 360 },
    checkpoint: { x: 965, y: 364 },
    npc: {
      x: 1815,
      y: 364,
      nameRu: "Офицер Раду",
      nameRo: "Ofițer Radu",
      shirt: "#059669",
      accent: "#34d399",
    },
    platforms: [
      { x: 0, y: 416, w: 380, h: 64, style: "floor" },
      { x: 210, y: 320, w: 120, h: 20, style: "neon" },
      { x: 370, y: 235, w: 140, h: 20, style: "neon" },
      { x: 560, y: 416, w: 280, h: 64, style: "floor" },
      { x: 640, y: 290, w: 135, h: 20, style: "neon" },
      { x: 910, y: 416, w: 300, h: 64, style: "floor" },
      { x: 1000, y: 205, w: 150, h: 20, style: "neon" },
      { x: 1390, y: 416, w: 200, h: 64, style: "floor" },
      { x: 1425, y: 285, w: 140, h: 20, style: "neon" },
      { x: 1640, y: 416, w: 280, h: 64, style: "floor" },
    ],
    movingPlatforms: [
      { id: "m2-1", x: 425, y: 350, w: 105, h: 18, dx: 95, dy: 0, speed: 1.5 },
      { id: "m2-2", x: 1245, y: 345, w: 105, h: 18, dx: 90, dy: -45, speed: 1.45 },
    ],
    springs: [
      { x: 800, y: 402, w: 44 },
      { x: 1125, y: 402, w: 44 },
    ],
    lasers: [
      { x: 695, y: 336, w: 12, h: 80, period: 2.3, phaseOffset: 0.4 },
      { x: 1485, y: 336, w: 12, h: 80, period: 2.3, phaseOffset: 1.2 },
    ],
    bots: [
      { id: "b2-1", x: 620, y: 392, minX: 575, maxX: 785, speed: 108 },
      { id: "b2-2", x: 1010, y: 392, minX: 930, maxX: 1105, speed: 115 },
    ],
    clues: [
      { id: "c2-1", x: 440, y: 195, emoji: "🔷", labelRu: "Синий чип", labelRo: "Cip albastru" },
      { id: "c2-2", x: 1075, y: 165, emoji: "🟡", labelRu: "Золотой чип", labelRo: "Cip auriu" },
      { id: "c2-3", x: 1495, y: 245, emoji: "🟢", labelRu: "Зелёный чип", labelRo: "Cip verde" },
    ],
  },

  // Mission 3: Laser Park — neon bridges, pulsing lasers, fast bots
  3: {
    missionId: 3,
    worldW: WORLD_W,
    worldH: WORLD_H,
    titleRu: "Лазер-Парк · Путь к Алине",
    titleRo: "Parc Laser · Drumul spre Alina",
    bgTop: "#083344",
    bgBottom: "#090d24",
    accent: "#00d9ff",
    platformFill: "#164e63",
    platformTop: "#00d9ff",
    spawn: { x: 70, y: 360 },
    checkpoint: { x: 965, y: 364 },
    npc: {
      x: 1815,
      y: 364,
      nameRu: "Алина",
      nameRo: "Alina",
      shirt: "#0284c7",
      accent: "#00d9ff",
    },
    platforms: [
      { x: 0, y: 416, w: 360, h: 64, style: "floor" },
      { x: 190, y: 315, w: 120, h: 20, style: "neon" },
      { x: 350, y: 225, w: 135, h: 20, style: "neon" },
      { x: 455, y: 416, w: 330, h: 64, style: "floor" },
      { x: 640, y: 310, w: 125, h: 20, style: "neon" },
      { x: 895, y: 416, w: 310, h: 64, style: "floor" },
      { x: 985, y: 240, w: 150, h: 20, style: "neon" },
      { x: 1365, y: 416, w: 225, h: 64, style: "floor" },
      { x: 1420, y: 230, w: 145, h: 20, style: "neon" },
      { x: 1650, y: 416, w: 270, h: 64, style: "floor" },
    ],
    movingPlatforms: [
      { id: "m3-1", x: 795, y: 290, w: 95, h: 18, dx: 0, dy: -85, speed: 1.75 },
      { id: "m3-2", x: 1235, y: 345, w: 105, h: 18, dx: 95, dy: 0, speed: 1.7 },
    ],
    springs: [
      { x: 310, y: 402, w: 44 },
      { x: 1135, y: 402, w: 44 },
      { x: 1380, y: 402, w: 44 },
    ],
    lasers: [
      { x: 545, y: 336, w: 12, h: 80, period: 2.1, phaseOffset: 0 },
      { x: 1055, y: 336, w: 12, h: 80, period: 2.1, phaseOffset: 0.9 },
      { x: 1525, y: 336, w: 12, h: 80, period: 2.1, phaseOffset: 1.6 },
    ],
    bots: [
      { id: "b3-1", x: 600, y: 392, minX: 480, maxX: 760, speed: 122 },
      { id: "b3-2", x: 960, y: 392, minX: 915, maxX: 1120, speed: 128 },
      { id: "b3-3", x: 1700, y: 392, minX: 1665, maxX: 1760, speed: 100 },
    ],
    clues: [
      { id: "c3-1", x: 418, y: 185, emoji: "⚡", labelRu: "Энергоядро 1", labelRo: "Nucleu 1" },
      { id: "c3-2", x: 1060, y: 200, emoji: "🛡️", labelRu: "Код щита", labelRo: "Cod scut" },
      { id: "c3-3", x: 1492, y: 190, emoji: "🔋", labelRu: "Заряд портала", labelRo: "Baterie portal" },
    ],
  },

  // Mission 4: Shadow HQ — crimson cyber tower, springs, lasers, patrol drones
  4: {
    missionId: 4,
    worldW: WORLD_W,
    worldH: WORLD_H,
    titleRu: "Штаб Тени · Штурм главной двери",
    titleRo: "Baza Umbrei · Spre ușa finală",
    bgTop: "#2a030d",
    bgBottom: "#09071a",
    accent: "#fb7185",
    platformFill: "#4c0519",
    platformTop: "#fb7185",
    spawn: { x: 70, y: 360 },
    checkpoint: { x: 965, y: 364 },
    npc: {
      x: 1815,
      y: 364,
      nameRu: "Босс Тень",
      nameRo: "Boss Umbra",
      shirt: "#be123c",
      accent: "#fb7185",
    },
    platforms: [
      { x: 0, y: 416, w: 350, h: 64, style: "floor" },
      { x: 225, y: 320, w: 125, h: 20, style: "brick" },
      { x: 390, y: 225, w: 140, h: 20, style: "brick" },
      { x: 480, y: 416, w: 300, h: 64, style: "floor" },
      { x: 640, y: 305, w: 130, h: 20, style: "brick" },
      { x: 910, y: 416, w: 300, h: 64, style: "floor" },
      { x: 965, y: 215, w: 160, h: 20, style: "brick" },
      { x: 1375, y: 416, w: 215, h: 64, style: "floor" },
      { x: 1420, y: 240, w: 145, h: 20, style: "brick" },
      { x: 1655, y: 416, w: 265, h: 64, style: "floor" },
    ],
    movingPlatforms: [
      { id: "m4-1", x: 375, y: 355, w: 95, h: 18, dx: 85, dy: 0, speed: 1.85 },
      { id: "m4-2", x: 805, y: 315, w: 95, h: 18, dx: 0, dy: -90, speed: 1.8 },
      { id: "m4-3", x: 1235, y: 345, w: 100, h: 18, dx: 105, dy: -35, speed: 1.8 },
    ],
    springs: [
      { x: 295, y: 402, w: 44 },
      { x: 1140, y: 402, w: 44 },
      { x: 1390, y: 402, w: 44 },
    ],
    lasers: [
      { x: 560, y: 336, w: 12, h: 80, period: 2.0, phaseOffset: 0 },
      { x: 1045, y: 336, w: 12, h: 80, period: 2.0, phaseOffset: 0.7 },
      { x: 1525, y: 336, w: 12, h: 80, period: 2.0, phaseOffset: 1.4 },
    ],
    bots: [
      { id: "b4-1", x: 580, y: 392, minX: 495, maxX: 755, speed: 132 },
      { id: "b4-2", x: 990, y: 392, minX: 930, maxX: 1125, speed: 138 },
      { id: "b4-3", x: 1680, y: 392, minX: 1665, maxX: 1765, speed: 118 },
    ],
    clues: [
      { id: "c4-1", x: 460, y: 185, emoji: "🔑", labelRu: "Ключ-пазл", labelRo: "Cheie-puzzle" },
      { id: "c4-2", x: 1045, y: 175, emoji: "🪪", labelRu: "Пропуск", labelRo: "Ecuson" },
      { id: "c4-3", x: 1492, y: 200, emoji: "🔴", labelRu: "Декодер лазера", labelRo: "Decodor laser" },
    ],
  },
};
