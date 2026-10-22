import type { RoadNetwork, RoadNode } from "./RoadNetwork";

export interface CityMapConfig {
  width: number;
  height: number;
  tileSize: number;
  spacing: number;
  blockSize: number;
  scale: number;
}

export const DEFAULT_CITY_CONFIG: CityMapConfig = {
  width: 50,
  height: 38,
  tileSize: 16,
  spacing: 0,
  blockSize: 10,
  scale: 2, // 16px * 2 = 32px per tile -> 1600 x 1216 world
};

// Tile ID constants
export const TILE = {
  GRASS: 200,
  WATER: 201,
  SAND: 202,
  PLAZA_DARK: 210,
  PLAZA_MID: 211,
  PLAZA_LIGHT: 212,
  ROAD_PLAIN: 1,
  ROAD_DASH_H: 2,
  ROAD_DASH_V: 3,
  ROAD_YELLOW_H: 4,
  ROAD_YELLOW_V: 5,
  ROAD_DRAIN: 6,
  ROAD_MANHOLE: 7,
  ROAD_CROSS: 11,
  SIDEWALK_PLAIN: 20,
  SIDEWALK_GRID: 21,
  SIDEWALK_LIGHT: 22,
  CROSSWALK_H: 30,
  CROSSWALK_V: 31,
} as const;

/** Exact sprite frame rectangles inside `/CP_V1.1.0_nyknck/CP_V1.0.4_nyknck/CP_V1.0.4.png` (1024x1024) */
export const CP_MAIN_FRAMES: Record<string, { x: number; y: number; w: number; h: number }> = {
  // 16x16 Ground & Road tiles
  road_drain: { x: 16, y: 608, w: 16, h: 16 },
  road_plain: { x: 48, y: 608, w: 16, h: 16 },
  road_dash_h: { x: 80, y: 608, w: 16, h: 16 },
  road_dash_v: { x: 112, y: 608, w: 16, h: 16 },
  road_corner: { x: 144, y: 608, w: 16, h: 16 },
  road_yellow_v: { x: 16, y: 640, w: 16, h: 16 },
  road_yellow_h: { x: 48, y: 640, w: 16, h: 16 },
  road_edge_r: { x: 80, y: 640, w: 16, h: 16 },
  road_edge_l: { x: 112, y: 640, w: 16, h: 16 },
  road_edge_v: { x: 144, y: 640, w: 16, h: 16 },
  road_manhole: { x: 16, y: 672, w: 16, h: 16 },
  crosswalk_v: { x: 48, y: 672, w: 16, h: 16 },
  crosswalk_h: { x: 80, y: 672, w: 16, h: 16 },
  sidewalk_grid: { x: 336, y: 608, w: 16, h: 16 },
  sidewalk_plain: { x: 336, y: 640, w: 16, h: 16 },
  sidewalk_light: { x: 336, y: 672, w: 16, h: 16 },
  water_plain: { x: 48, y: 816, w: 16, h: 16 },
  grass_plain: { x: 80, y: 816, w: 16, h: 16 },
  sand_plain: { x: 256, y: 800, w: 16, h: 16 },
  plaza_dark: { x: 432, y: 816, w: 16, h: 16 },
  plaza_mid: { x: 544, y: 816, w: 16, h: 16 },
  plaza_light: { x: 656, y: 816, w: 16, h: 16 },

  // Buildings
  bldg_red_tall: { x: 32, y: 32, w: 48, h: 96 },
  bldg_blue_tall: { x: 112, y: 32, w: 48, h: 96 },
  bldg_glass_tower: { x: 192, y: 32, w: 48, h: 96 },
  bldg_bank_hq: { x: 272, y: 32, w: 80, h: 96 },
  bldg_white_civic: { x: 16, y: 176, w: 64, h: 48 },
  bldg_cyan_shop: { x: 112, y: 176, w: 48, h: 48 },
  bldg_school_hall: { x: 192, y: 170, w: 64, h: 54 },
  bldg_post_office: { x: 288, y: 176, w: 48, h: 48 },
  bldg_green_market: { x: 16, y: 278, w: 64, h: 42 },
  bldg_brick_house: { x: 112, y: 278, w: 48, h: 42 },
  bldg_kiosk: { x: 208, y: 272, w: 32, h: 48 },
  bldg_blue_glass_tall: { x: 288, y: 272, w: 48, h: 96 },

  // Large plazas / bridges
  plaza_bridge_warm: { x: 704, y: 32, w: 192, h: 112 },
  plaza_bridge_cool: { x: 704, y: 192, w: 192, h: 112 },

  // Street props & furniture
  bench_red: { x: 400, y: 48, w: 32, h: 16 },
  bench_orange: { x: 464, y: 48, w: 32, h: 16 },
  info_board: { x: 512, y: 48, w: 16, h: 16 },
  bike_rack: { x: 432, y: 85, w: 16, h: 11 },
  barrier_striped: { x: 400, y: 131, w: 16, h: 13 },
  barrier_red: { x: 464, y: 128, w: 16, h: 16 },
  cone: { x: 497, y: 131, w: 14, h: 13 },
  trash_can: { x: 401, y: 160, w: 14, h: 16 },
  mailbox: { x: 432, y: 160, w: 16, h: 16 },
  hydrant: { x: 466, y: 162, w: 10, h: 14 },
  vending: { x: 496, y: 176, w: 25, h: 32 },
  boxes_small: { x: 544, y: 185, w: 16, h: 23 },
  boxes_tall: { x: 576, y: 185, w: 16, h: 23 },
  boxes_wide: { x: 608, y: 188, w: 23, h: 20 },
  sign_blue: { x: 368, y: 254, w: 48, h: 66 },
  sign_green: { x: 432, y: 254, w: 48, h: 66 },
  sign_white: { x: 496, y: 254, w: 48, h: 66 },
  sign_diamond: { x: 385, y: 468, w: 14, h: 28 },
  sign_speed: { x: 418, y: 470, w: 12, h: 26 },
  sign_stop: { x: 450, y: 470, w: 12, h: 26 },
  tree_round: { x: 384, y: 514, w: 16, h: 30 },
  tree_oval: { x: 415, y: 517, w: 18, h: 27 },

  // Vehicles
  truck_red_h: { x: 17, y: 384, w: 64, h: 32 },
  car_red_h: { x: 129, y: 389, w: 48, h: 27 },
  truck_blue_h: { x: 16, y: 448, w: 64, h: 32 },
  car_blue_h: { x: 128, y: 453, w: 48, h: 27 },
  truck_v: { x: 271, y: 400, w: 34, h: 50 },
  car_orange_v: { x: 240, y: 483, w: 32, h: 45 },
  car_police_v: { x: 304, y: 483, w: 32, h: 45 },
};

/** Exact frames inside `/CP_V1.1.0_nyknck/Animations/BL001.png` (Building Window Lights) */
export const CP_LIGHT_FRAMES: Record<string, { x: number; y: number; w: number; h: number }> = {
  bldg_red_tall_off: { x: 48, y: 32, w: 48, h: 96 },
  bldg_red_tall_on: { x: 128, y: 32, w: 48, h: 96 },
  bldg_blue_tall_off: { x: 48, y: 176, w: 48, h: 96 },
  bldg_blue_tall_on: { x: 128, y: 176, w: 48, h: 96 },
  bldg_glass_tower_off: { x: 48, y: 304, w: 48, h: 96 },
  bldg_glass_tower_on: { x: 128, y: 304, w: 48, h: 96 },
  bldg_bank_hq_off: { x: 48, y: 432, w: 80, h: 96 },
  bldg_bank_hq_on: { x: 144, y: 432, w: 80, h: 96 },
  bldg_green_market_off: { x: 48, y: 598, w: 64, h: 42 },
  bldg_green_market_on: { x: 144, y: 598, w: 64, h: 42 },
  bldg_white_civic_off: { x: 48, y: 688, w: 64, h: 48 },
  bldg_white_civic_on: { x: 161, y: 688, w: 64, h: 48 },
  bldg_cyan_shop_off: { x: 48, y: 784, w: 48, h: 48 },
  bldg_cyan_shop_on: { x: 161, y: 784, w: 48, h: 48 },
  bldg_school_hall_off: { x: 49, y: 874, w: 64, h: 54 },
  bldg_school_hall_on: { x: 161, y: 874, w: 64, h: 54 },
  bldg_post_office_off: { x: 49, y: 960, w: 48, h: 48 },
  bldg_post_office_on: { x: 161, y: 960, w: 48, h: 48 },
  bldg_brick_house_off: { x: 49, y: 1062, w: 48, h: 42 },
  bldg_brick_house_on: { x: 161, y: 1062, w: 48, h: 42 },
  bldg_kiosk_off: { x: 49, y: 1152, w: 32, h: 48 },
  bldg_kiosk_on: { x: 161, y: 1152, w: 32, h: 48 },
  bldg_blue_glass_tall_off: { x: 49, y: 1232, w: 48, h: 96 },
  bldg_blue_glass_tall_on: { x: 161, y: 1232, w: 48, h: 96 },
};

/** Exact frames inside `/CP_V1.1.0_nyknck/Animations/BD001.png` (Building Doors: 0=closed, 1=half, 2=open) */
export const CP_DOOR_FRAMES: Record<string, { x: number; y: number; w: number; h: number }> = {
  bldg_green_market_d0: { x: 32, y: 22, w: 64, h: 42 },
  bldg_green_market_d1: { x: 144, y: 22, w: 64, h: 42 },
  bldg_green_market_d2: { x: 256, y: 22, w: 64, h: 42 },
  bldg_brick_house_d0: { x: 32, y: 102, w: 48, h: 42 },
  bldg_brick_house_d1: { x: 144, y: 102, w: 48, h: 42 },
  bldg_brick_house_d2: { x: 256, y: 102, w: 48, h: 42 },
  bldg_cyan_shop_d0: { x: 32, y: 208, w: 48, h: 48 },
  bldg_cyan_shop_d1: { x: 144, y: 208, w: 48, h: 48 },
  bldg_cyan_shop_d2: { x: 256, y: 208, w: 48, h: 48 },
  bldg_school_hall_d0: { x: 32, y: 314, w: 64, h: 54 },
  bldg_school_hall_d1: { x: 144, y: 314, w: 64, h: 54 },
  bldg_school_hall_d2: { x: 256, y: 314, w: 64, h: 54 },
  bldg_post_office_d0: { x: 32, y: 416, w: 48, h: 48 },
  bldg_post_office_d1: { x: 144, y: 416, w: 48, h: 48 },
  bldg_post_office_d2: { x: 256, y: 416, w: 48, h: 48 },
  bldg_bank_hq_d0: { x: 32, y: 880, w: 80, h: 96 },
  bldg_bank_hq_d1: { x: 145, y: 880, w: 80, h: 96 },
  bldg_bank_hq_d2: { x: 258, y: 880, w: 80, h: 96 },
};

/** Exact frames inside `/CP_V1.1.0_nyknck/Animations/SL001.png` (Traffic Lights & Street Lamps) */
export const CP_STREETLIGHT_FRAMES: Record<string, { x: number; y: number; w: number; h: number }> = {
  tl_post_0: { x: 31, y: 34, w: 8, h: 30 },
  tl_post_1: { x: 63, y: 34, w: 8, h: 30 },
  tl_post_2: { x: 95, y: 34, w: 8, h: 30 },
  tl_post_3: { x: 127, y: 34, w: 8, h: 30 },
  tl_arm_r_0: { x: 32, y: 80, w: 29, h: 32 },
  tl_arm_r_1: { x: 80, y: 80, w: 29, h: 32 },
  tl_arm_r_2: { x: 128, y: 80, w: 29, h: 32 },
  tl_arm_r_3: { x: 176, y: 80, w: 29, h: 32 },
  tl_arm_l_0: { x: 35, y: 144, w: 29, h: 32 },
  tl_arm_l_1: { x: 83, y: 144, w: 29, h: 32 },
  tl_arm_l_2: { x: 131, y: 144, w: 29, h: 32 },
  tl_arm_l_3: { x: 179, y: 144, w: 29, h: 32 },
  lamp_single_off: { x: 32, y: 368, w: 9, h: 32 },
  lamp_single_glow: { x: 53, y: 368, w: 31, h: 32 },
  lamp_arch_off: { x: 32, y: 416, w: 24, h: 32 },
  lamp_arch_glow: { x: 64, y: 416, w: 36, h: 32 },
  lamp_classic_off: { x: 32, y: 513, w: 9, h: 31 },
  lamp_classic_glow: { x: 52, y: 513, w: 33, h: 31 },
};

export interface CityBuildingPlacement {
  frame: string;
  x: number;
  y: number;
  scale?: number;
  animatedLight?: boolean;
  animatedDoor?: boolean;
  label?: { ru: string; ro: string };
}

export interface CityPropPlacement {
  frame: string;
  x: number;
  y: number;
  scale?: number;
  kind?: "static" | "traffic_light_r" | "traffic_light_l" | "street_lamp";
}

export interface CityVehicleTrack {
  frame: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  flipX?: boolean;
}

/** Curated city buildings across the 4 districts (School NW, Bank NE, Post SW, Shop SE) */
export const CITY_BUILDINGS: CityBuildingPlacement[] = [
  // === NW: SCHOOL DISTRICT (x=120..700, y=140..510; NPC at 350, 465) ===
  { frame: "bldg_school_hall", x: 350, y: 395, scale: 2.35, animatedDoor: true, label: { ru: "ЛИЦЕЙ / ШКОЛА", ro: "LICEU / ȘCOALĂ" } },
  { frame: "bldg_white_civic", x: 540, y: 400, scale: 2.2, animatedLight: true },
  { frame: "bldg_blue_tall", x: 175, y: 365, scale: 2.15, animatedLight: true },
  { frame: "bldg_red_tall", x: 665, y: 360, scale: 2.15, animatedLight: true },
  { frame: "bldg_brick_house", x: 470, y: 235, scale: 2.2, animatedLight: true },
  { frame: "bldg_kiosk", x: 260, y: 235, scale: 2.15, animatedLight: true },

  // === NE: BANK & TECH DISTRICT (x=900..1480, y=140..510; NPC at 1250, 465) ===
  { frame: "bldg_bank_hq", x: 1250, y: 395, scale: 2.25, animatedDoor: true, label: { ru: "ЦЕНТРАЛЬНЫЙ БАНК", ro: "BANCA CENTRALĂ" } },
  { frame: "bldg_glass_tower", x: 1035, y: 365, scale: 2.2, animatedLight: true },
  { frame: "bldg_blue_glass_tall", x: 1435, y: 365, scale: 2.2, animatedLight: true },
  { frame: "bldg_blue_tall", x: 925, y: 355, scale: 2.1, animatedLight: true },
  { frame: "bldg_white_civic", x: 1125, y: 225, scale: 2.15, animatedLight: true },

  // === SW: POST & RESIDENTIAL DISTRICT (x=120..700, y=680..1080; NPC at 350, 860) ===
  { frame: "bldg_post_office", x: 350, y: 805, scale: 2.4, animatedDoor: true, label: { ru: "ПОЧТА МОЛДОВЫ", ro: "POȘTA MOLDOVEI" } },
  { frame: "bldg_brick_house", x: 530, y: 805, scale: 2.25, animatedLight: true },
  { frame: "bldg_white_civic", x: 185, y: 815, scale: 2.15, animatedLight: true },
  { frame: "bldg_red_tall", x: 655, y: 980, scale: 2.15, animatedLight: true },
  { frame: "bldg_brick_house", x: 205, y: 1035, scale: 2.2, animatedLight: true },
  { frame: "bldg_green_market", x: 495, y: 1035, scale: 2.15, animatedLight: true },

  // === SE: SHOP & COMMERCIAL DISTRICT (x=900..1480, y=680..1080; NPC at 1250, 860) ===
  { frame: "bldg_cyan_shop", x: 1250, y: 805, scale: 2.4, animatedDoor: true, label: { ru: "МАРКЕТ / SHOP", ro: "MAGAZIN / SHOP" } },
  { frame: "bldg_green_market", x: 1055, y: 805, scale: 2.25, animatedDoor: true },
  { frame: "bldg_school_hall", x: 1430, y: 815, scale: 2.1, animatedLight: true },
  { frame: "bldg_kiosk", x: 925, y: 810, scale: 2.2, animatedLight: true },
  { frame: "bldg_blue_glass_tall", x: 1065, y: 1045, scale: 2.1, animatedLight: true },
  { frame: "bldg_red_tall", x: 1410, y: 1045, scale: 2.1, animatedLight: true },
];

export const CITY_PROPS: CityPropPlacement[] = [
  // Highway signs near central avenues
  { frame: "sign_blue", x: 675, y: 535, scale: 1.8 },
  { frame: "sign_green", x: 925, y: 535, scale: 1.8 },
  { frame: "sign_white", x: 675, y: 695, scale: 1.8 },

  // Traffic lights at the Central Intersection
  { frame: "tl_arm_r_0", x: 730, y: 545, scale: 2.1, kind: "traffic_light_r" },
  { frame: "tl_arm_l_0", x: 870, y: 545, scale: 2.1, kind: "traffic_light_l" },
  { frame: "tl_arm_r_0", x: 730, y: 685, scale: 2.1, kind: "traffic_light_r" },
  { frame: "tl_arm_l_0", x: 870, y: 685, scale: 2.1, kind: "traffic_light_l" },

  // Street lamps along boulevards
  { frame: "lamp_classic_glow", x: 250, y: 545, scale: 2.0, kind: "street_lamp" },
  { frame: "lamp_classic_glow", x: 480, y: 545, scale: 2.0, kind: "street_lamp" },
  { frame: "lamp_classic_glow", x: 1120, y: 545, scale: 2.0, kind: "street_lamp" },
  { frame: "lamp_classic_glow", x: 1360, y: 545, scale: 2.0, kind: "street_lamp" },
  { frame: "lamp_classic_glow", x: 250, y: 685, scale: 2.0, kind: "street_lamp" },
  { frame: "lamp_classic_glow", x: 480, y: 685, scale: 2.0, kind: "street_lamp" },
  { frame: "lamp_classic_glow", x: 1120, y: 685, scale: 2.0, kind: "street_lamp" },
  { frame: "lamp_classic_glow", x: 1360, y: 685, scale: 2.0, kind: "street_lamp" },

  // District props: School (benches, bike racks, info boards, trees)
  { frame: "bench_red", x: 265, y: 440, scale: 2.0 },
  { frame: "bike_rack", x: 435, y: 440, scale: 2.0 },
  { frame: "info_board", x: 295, y: 410, scale: 2.0 },
  { frame: "tree_round", x: 135, y: 430, scale: 2.2 },
  { frame: "tree_oval", x: 605, y: 440, scale: 2.2 },
  { frame: "tree_round", x: 365, y: 245, scale: 2.2 },

  // District props: Bank (barriers, hydrants, trees, signs)
  { frame: "hydrant", x: 1155, y: 440, scale: 2.0 },
  { frame: "bench_orange", x: 1355, y: 440, scale: 2.0 },
  { frame: "sign_speed", x: 1000, y: 540, scale: 2.0 },
  { frame: "tree_oval", x: 985, y: 435, scale: 2.2 },
  { frame: "tree_round", x: 1475, y: 435, scale: 2.2 },

  // District props: Post (mailbox, parcel boxes, trash can, trees)
  { frame: "mailbox", x: 285, y: 825, scale: 2.2 },
  { frame: "boxes_small", x: 415, y: 825, scale: 2.0 },
  { frame: "boxes_wide", x: 445, y: 828, scale: 2.0 },
  { frame: "trash_can", x: 255, y: 825, scale: 2.0 },
  { frame: "tree_round", x: 135, y: 920, scale: 2.2 },
  { frame: "tree_oval", x: 590, y: 920, scale: 2.2 },

  // District props: Shop (vending machines, benches, cones, trees)
  { frame: "vending", x: 1175, y: 815, scale: 2.0 },
  { frame: "vending", x: 1325, y: 815, scale: 2.0 },
  { frame: "bench_orange", x: 995, y: 835, scale: 2.0 },
  { frame: "cone", x: 1365, y: 835, scale: 2.0 },
  { frame: "tree_oval", x: 1475, y: 920, scale: 2.2 },
  { frame: "tree_round", x: 965, y: 950, scale: 2.2 },
];

export const CITY_VEHICLES: CityVehicleTrack[] = [
  // Horizontal boulevard traffic
  { frame: "car_blue_h", startX: -80, startY: 592, endX: 1680, endY: 592, speed: 95, flipX: true },
  { frame: "truck_red_h", startX: 1680, startY: 626, endX: -80, endY: 626, speed: 75, flipX: false },
  { frame: "car_red_h", startX: 700, startY: 592, endX: 1680, endY: 592, speed: 110, flipX: true },
  // Vertical avenue traffic
  { frame: "car_police_v", startX: 784, startY: -80, endX: 784, endY: 1290, speed: 105 },
  { frame: "car_orange_v", startX: 816, startY: 1290, endX: 816, endY: -80, speed: 90 },
];

export class CityMapGenerator {
  private roadNetwork: RoadNetwork;
  private config: CityMapConfig;
  private tileMap: number[][] = [];

  constructor(roadNetwork: RoadNetwork, config: Partial<CityMapConfig> = {}) {
    this.roadNetwork = roadNetwork;
    this.config = { ...DEFAULT_CITY_CONFIG, ...config };
  }

  generate(): number[][] {
    const { width, height } = this.config;
    const grid: number[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => TILE.GRASS),
    );

    // 1. Pave the 4 district plazas cleanly with urban slabs and bordered sidewalks
    const blocks = [
      { x0: 3, y0: 4, x1: 22, y1: 16 },   // NW School block
      { x0: 28, y0: 4, x1: 46, y1: 16 },  // NE Bank block
      { x0: 3, y0: 22, x1: 22, y1: 34 },  // SW Post block
      { x0: 28, y0: 22, x1: 46, y1: 34 }, // SE Shop block
    ];
    for (const b of blocks) {
      for (let y = b.y0; y <= b.y1; y++) {
        for (let x = b.x0; x <= b.x1; x++) {
          const isBorder = x === b.x0 || x === b.x1 || y === b.y0 || y === b.y1;
          grid[y][x] = isBorder ? TILE.SIDEWALK_GRID : (x + y) % 5 === 0 ? TILE.PLAZA_LIGHT : TILE.PLAZA_MID;
        }
      }
    }

    // Add small green park ponds in outer corners
    for (let y = 5; y <= 7; y++) {
      for (let x = 5; x <= 7; x++) {
        grid[y][x] = y === 6 && x === 6 ? TILE.WATER : TILE.GRASS;
      }
      for (let x = 42; x <= 44; x++) {
        grid[y][x] = y === 6 && x === 43 ? TILE.WATER : TILE.GRASS;
      }
    }

    // 2. Horizontal roads: North ring (y=2..3), Central Boulevard (y=18..20), South ring (y=35..36)
    const hRoads = [
      { yRows: [2, 3], centerRow: 2, centerTile: TILE.ROAD_DASH_H },
      { yRows: [18, 19, 20], centerRow: 19, centerTile: TILE.ROAD_YELLOW_H },
      { yRows: [35, 36], centerRow: 35, centerTile: TILE.ROAD_DASH_H },
    ];
    for (const hr of hRoads) {
      const topSidewalk = hr.yRows[0] - 1;
      const botSidewalk = hr.yRows[hr.yRows.length - 1] + 1;
      for (let x = 0; x < width; x++) {
        if (topSidewalk >= 0) grid[topSidewalk][x] = TILE.SIDEWALK_PLAIN;
        if (botSidewalk < height) grid[botSidewalk][x] = TILE.SIDEWALK_PLAIN;
        for (const ry of hr.yRows) {
          if (ry === hr.centerRow) {
            grid[ry][x] = hr.centerTile;
          } else {
            grid[ry][x] = x % 9 === 0 ? TILE.ROAD_DRAIN : TILE.ROAD_PLAIN;
          }
        }
      }
    }

    // 3. Vertical roads: West ring (x=1..2), Central Avenue (x=24..26), East ring (x=47..48)
    const vRoads = [
      { xCols: [1, 2], centerCol: 1, centerTile: TILE.ROAD_DASH_V },
      { xCols: [24, 25, 26], centerCol: 25, centerTile: TILE.ROAD_YELLOW_V },
      { xCols: [47, 48], centerCol: 47, centerTile: TILE.ROAD_DASH_V },
    ];
    for (const vr of vRoads) {
      const leftSidewalk = vr.xCols[0] - 1;
      const rightSidewalk = vr.xCols[vr.xCols.length - 1] + 1;
      for (let y = 0; y < height; y++) {
        if (leftSidewalk >= 0 && grid[y][leftSidewalk] >= 200) grid[y][leftSidewalk] = TILE.SIDEWALK_PLAIN;
        if (rightSidewalk < height && rightSidewalk < width && grid[y][rightSidewalk] >= 200) {
          grid[y][rightSidewalk] = TILE.SIDEWALK_PLAIN;
        }
        for (const rx of vr.xCols) {
          const existing = grid[y][rx];
          const isHIntersection = existing >= 1 && existing <= 11;
          if (isHIntersection) {
            grid[y][rx] = rx === 25 && y === 19 ? TILE.ROAD_MANHOLE : TILE.ROAD_CROSS;
          } else if (rx === vr.centerCol) {
            grid[y][rx] = vr.centerTile;
          } else {
            grid[y][rx] = TILE.ROAD_PLAIN;
          }
        }
      }
    }

    // 4. Crosswalks at Central Intersection & District entrances
    for (const cx of [11, 23, 27, 39]) {
      for (const ry of [18, 19, 20]) {
        grid[ry][cx] = TILE.CROSSWALK_V;
      }
    }
    for (const cy of [17, 21]) {
      for (const rx of [24, 25, 26]) {
        grid[cy][rx] = TILE.CROSSWALK_H;
      }
    }

    this.tileMap = grid;
    return grid;
  }

  getTileMap(): number[][] {
    return this.tileMap;
  }

  getRoadGraph(): { nodes: RoadNode[]; edges: { from: string; to: string; direction: string }[] } {
    return { nodes: [], edges: [] };
  }
}
