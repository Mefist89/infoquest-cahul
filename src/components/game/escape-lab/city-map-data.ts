export const WORLD_W = 1280;
export const WORLD_H = 860;

export type MissionId = 1 | 2 | 3 | 4;

export type CityBuilding = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  roofColor: string;
  trimColor: string;
  wallColor: string;
  missionId?: MissionId;
  labelRu?: string;
  labelRo?: string;
};

export type MissionNpc = {
  missionId: MissionId;
  x: number;
  y: number;
  color: string;
  shirt: string;
  nameRu: string;
  nameRo: string;
  titleRu: string;
  titleRo: string;
  shortRu: string;
  shortRo: string;
};

export type StreetStar = {
  id: string;
  x: number;
  y: number;
};

export type TrafficCar = {
  x: number;
  y: number;
  axis: "h" | "v";
  dir: 1 | -1;
  speed: number;
  color: string;
  w: number;
  h: number;
};

export const CITY_BUILDINGS: readonly CityBuilding[] = [
  // Top-left: Cyber Office (Mission 1)
  {
    id: "office",
    x: 70,
    y: 55,
    w: 250,
    h: 150,
    roofColor: "#172554",
    trimColor: "#38bdf8",
    wallColor: "#0f172a",
    missionId: 1,
    labelRu: "КИБЕР-ОФИС",
    labelRo: "CYBER-BIROU",
  },
  // Top-center decorative Cyber Cafe
  {
    id: "cafe",
    x: 495,
    y: 55,
    w: 265,
    h: 145,
    roofColor: "#312e81",
    trimColor: "#a78bfa",
    wallColor: "#1e1b4b",
    labelRu: "КАФЕ-НЕТ",
    labelRo: "CAFE-NET",
  },
  // Top-right: Server Station (Mission 2)
  {
    id: "server",
    x: 940,
    y: 55,
    w: 260,
    h: 150,
    roofColor: "#064e3b",
    trimColor: "#34d399",
    wallColor: "#022c22",
    missionId: 2,
    labelRu: "СЕРВЕРНАЯ",
    labelRo: "SERVERE",
  },
  // Mid-left decorative Library
  {
    id: "school",
    x: 70,
    y: 340,
    w: 245,
    h: 165,
    roofColor: "#3b1d5a",
    trimColor: "#f472b6",
    wallColor: "#25113a",
    labelRu: "ШКОЛА",
    labelRo: "ȘCOALA",
  },
  // Mid-right decorative Bank
  {
    id: "bank",
    x: 945,
    y: 340,
    w: 255,
    h: 165,
    roofColor: "#422006",
    trimColor: "#fbbf24",
    wallColor: "#291404",
    labelRu: "БАНК",
    labelRo: "BANCĂ",
  },
  // Bottom-left: Laser Tower (Mission 3)
  {
    id: "laser",
    x: 70,
    y: 645,
    w: 255,
    h: 155,
    roofColor: "#164e63",
    trimColor: "#00d9ff",
    wallColor: "#083344",
    missionId: 3,
    labelRu: "ЛАЗЕР-ПАРК",
    labelRo: "PARC LASER",
  },
  // Bottom-center decorative Arcade
  {
    id: "arcade",
    x: 495,
    y: 650,
    w: 265,
    h: 150,
    roofColor: "#1e293b",
    trimColor: "#38bdf8",
    wallColor: "#0f172a",
    labelRu: "ИГРОВОЙ КЛУБ",
    labelRo: "ARCADE",
  },
  // Bottom-right: Shadow HQ (Mission 4 - Final Boss)
  {
    id: "boss",
    x: 940,
    y: 645,
    w: 260,
    h: 155,
    roofColor: "#4c0519",
    trimColor: "#fb7185",
    wallColor: "#2a030d",
    missionId: 4,
    labelRu: "ШТАБ ТЕНИ",
    labelRo: "BAZA UMBREI",
  },
];

export const MISSION_NPCS: readonly MissionNpc[] = [
  {
    missionId: 1,
    x: 200,
    y: 235,
    color: "#38bdf8",
    shirt: "#7c3aed",
    nameRu: "Наталья",
    nameRo: "Natalia",
    titleRu: "Запертый кабинет",
    titleRo: "Biroul încuiat",
    shortRu: "Поиск вещей и код-замок",
    shortRo: "Obiecte ascunse și cod",
  },
  {
    missionId: 2,
    x: 1065,
    y: 235,
    color: "#34d399",
    shirt: "#059669",
    nameRu: "Офицер Раду",
    nameRo: "Ofițer Radu",
    titleRu: "Серверная ловушка",
    titleRo: "Camera serverelor",
    shortRu: "Пазл-провода и логика",
    shortRo: "Puzzle cabluri și logică",
  },
  {
    missionId: 3,
    x: 205,
    y: 615,
    color: "#00d9ff",
    shirt: "#0284c7",
    nameRu: "Алина",
    nameRo: "Alina",
    titleRu: "Лазерный коридор",
    titleRo: "Coridorul laser",
    shortRu: "Экшен: сбивай вирусы!",
    shortRo: "Acțiune: oprește virușii!",
  },
  {
    missionId: 4,
    x: 1065,
    y: 615,
    color: "#fb7185",
    shirt: "#be123c",
    nameRu: "Босс Тень",
    nameRo: "Boss Umbra",
    titleRu: "Главная дверь Тени",
    titleRo: "Ușa finală a Umbrei",
    shortRu: "Финал: 3 замка выхода!",
    shortRo: "Final: 3 lacăte spre ieșire!",
  },
];

export const STREET_STARS: readonly StreetStar[] = [
  { id: "s1", x: 350, y: 120 },
  { id: "s2", x: 890, y: 120 },
  { id: "s3", x: 630, y: 315 },
  { id: "s4", x: 520, y: 425 },
  { id: "s5", x: 740, y: 425 },
  { id: "s6", x: 630, y: 535 },
  { id: "s7", x: 350, y: 740 },
  { id: "s8", x: 890, y: 740 },
];

export const PARK_TREES: readonly [number, number, number][] = [
  [515, 355, 22],
  [745, 355, 22],
  [515, 495, 22],
  [745, 495, 22],
  [480, 425, 18],
  [780, 425, 18],
  [350, 210, 16],
  [905, 210, 16],
  [350, 625, 16],
  [905, 625, 16],
];

export function createInitialCars(): TrafficCar[] {
  return [
    { x: 120, y: 268, axis: "h", dir: 1, speed: 120, color: "#f43f5e", w: 46, h: 24 },
    { x: 1080, y: 298, axis: "h", dir: -1, speed: 110, color: "#fbbf24", w: 46, h: 24 },
    { x: 240, y: 558, axis: "h", dir: 1, speed: 130, color: "#38bdf8", w: 46, h: 24 },
    { x: 960, y: 588, axis: "h", dir: -1, speed: 115, color: "#a78bfa", w: 46, h: 24 },
    { x: 392, y: 140, axis: "v", dir: 1, speed: 105, color: "#34d399", w: 24, h: 46 },
    { x: 422, y: 700, axis: "v", dir: -1, speed: 115, color: "#fb923c", w: 24, h: 46 },
    { x: 842, y: 180, axis: "v", dir: 1, speed: 125, color: "#f472b6", w: 24, h: 46 },
    { x: 872, y: 660, axis: "v", dir: -1, speed: 100, color: "#22d3ee", w: 24, h: 46 },
  ];
}

export function hitsBuilding(x: number, y: number, radius: number): boolean {
  if (x - radius < 20 || x + radius > WORLD_W - 20 || y - radius < 20 || y + radius > WORLD_H - 20) {
    return true;
  }
  for (const b of CITY_BUILDINGS) {
    if (
      x + radius > b.x &&
      x - radius < b.x + b.w &&
      y + radius > b.y &&
      y - radius < b.y + b.h
    ) {
      return true;
    }
  }
  return false;
}
