import Phaser from "phaser";
import {
  CITY_BUILDINGS,
  CITY_PROPS,
  CITY_VEHICLES,
  CP_DOOR_FRAMES,
  CP_LIGHT_FRAMES,
  CP_MAIN_FRAMES,
  CP_STREETLIGHT_FRAMES,
  DEFAULT_CITY_CONFIG,
  TILE,
} from "./RoadMapGenerator";

export interface RoadTile {
  id: number;
  type: "road" | "sidewalk" | "building" | "grass" | "crosswalk" | "marking";
  connections?: { up: boolean; down: boolean; left: boolean; right: boolean };
  rotation?: 0 | 90 | 180 | 270;
}

export interface RoadNode {
  id: string;
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  connections: Map<string, RoadNode>;
  intersection: boolean;
}

export interface RoadGraph {
  nodes: Map<string, RoadNode>;
  intersections: RoadNode[];
}

export interface BuildingColliderSpec {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ActiveVehicle {
  sprite: Phaser.GameObjects.Image;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
}

interface DoorRecord {
  sprite: Phaser.GameObjects.Sprite;
  baseFrame: string;
  x: number;
  y: number;
  isOpen: boolean;
}

export class RoadNetwork {
  private scene: Phaser.Scene;
  private tileSize = DEFAULT_CITY_CONFIG.tileSize;
  private scale = DEFAULT_CITY_CONFIG.scale;
  private effectiveTileSize = DEFAULT_CITY_CONFIG.tileSize * DEFAULT_CITY_CONFIG.scale; // 32px

  private tileMap: number[][] = [];
  private roadGraph: RoadGraph = { nodes: new Map(), intersections: [] };
  private buildingColliders: BuildingColliderSpec[] = [];
  private vehicles: ActiveVehicle[] = [];
  private doors: DoorRecord[] = [];

  private roadTiles = new Set<number>([
    TILE.ROAD_PLAIN,
    TILE.ROAD_DASH_H,
    TILE.ROAD_DASH_V,
    TILE.ROAD_YELLOW_H,
    TILE.ROAD_YELLOW_V,
    TILE.ROAD_DRAIN,
    TILE.ROAD_MANHOLE,
    TILE.ROAD_CROSS,
  ]);
  private intersectionTiles = new Set<number>([TILE.ROAD_CROSS, TILE.ROAD_MANHOLE]);
  private sidewalkTiles = new Set<number>([
    TILE.SIDEWALK_PLAIN,
    TILE.SIDEWALK_GRID,
    TILE.SIDEWALK_LIGHT,
    TILE.PLAZA_DARK,
    TILE.PLAZA_MID,
    TILE.PLAZA_LIGHT,
  ]);
  private crosswalkTiles = new Set<number>([TILE.CROSSWALK_H, TILE.CROSSWALK_V]);

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  getTileMap(): number[][] {
    return this.tileMap;
  }

  getBuildingColliders(): BuildingColliderSpec[] {
    return this.buildingColliders;
  }

  isRoad(tileId: number): boolean {
    return this.roadTiles.has(tileId) || this.intersectionTiles.has(tileId);
  }

  isIntersection(tileId: number): boolean {
    return this.intersectionTiles.has(tileId);
  }

  isSidewalk(tileId: number): boolean {
    return this.sidewalkTiles.has(tileId);
  }

  isCrosswalk(tileId: number): boolean {
    return this.crosswalkTiles.has(tileId);
  }

  createRoadMap(width: number, height: number, tileMap?: number[][]): number[][] {
    if (tileMap) {
      this.tileMap = tileMap;
    }
    return this.tileMap;
  }

  buildRoadGraph(): RoadGraph {
    const graph: RoadGraph = { nodes: new Map(), intersections: [] };
    const height = this.tileMap.length;
    const width = this.tileMap[0]?.length || 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileId = this.tileMap[y][x];
        if (this.isRoad(tileId) || this.isSidewalk(tileId) || this.isCrosswalk(tileId)) {
          const key = `${x},${y}`;
          const node: RoadNode = {
            id: key,
            x: x * this.effectiveTileSize + this.effectiveTileSize / 2,
            y: y * this.effectiveTileSize + this.effectiveTileSize / 2,
            tileX: x,
            tileY: y,
            connections: new Map(),
            intersection: this.isIntersection(tileId),
          };
          graph.nodes.set(key, node);
          if (node.intersection) {
            graph.intersections.push(node);
          }
        }
      }
    }

    for (const node of graph.nodes.values()) {
      const { tileX, tileY } = node;
      const dirs = [
        { dx: 0, dy: -1, dir: "up" },
        { dx: 0, dy: 1, dir: "down" },
        { dx: -1, dy: 0, dir: "left" },
        { dx: 1, dy: 0, dir: "right" },
      ];
      for (const { dx, dy, dir } of dirs) {
        const neighbor = graph.nodes.get(`${tileX + dx},${tileY + dy}`);
        if (neighbor) {
          node.connections.set(dir, neighbor);
        }
      }
    }

    this.roadGraph = graph;
    return graph;
  }

  private registerTextureFrames(): void {
    const registerSet = (texKey: string, map: Record<string, { x: number; y: number; w: number; h: number }>) => {
      if (!this.scene.textures.exists(texKey)) return;
      const tex = this.scene.textures.get(texKey);
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
      for (const [name, rect] of Object.entries(map)) {
        if (!tex.has(name)) {
          tex.add(name, 0, rect.x, rect.y, rect.w, rect.h);
        }
      }
    };

    registerSet("cp-city", CP_MAIN_FRAMES);
    registerSet("cp-lights", CP_LIGHT_FRAMES);
    registerSet("cp-doors", CP_DOOR_FRAMES);
    registerSet("cp-streetlights", CP_STREETLIGHT_FRAMES);

    // Create traffic light animations if not already created
    if (!this.scene.anims.exists("cp-tl-r")) {
      this.scene.anims.create({
        key: "cp-tl-r",
        frames: [
          { key: "cp-streetlights", frame: "tl_arm_r_0", duration: 3200 },
          { key: "cp-streetlights", frame: "tl_arm_r_1", duration: 900 },
          { key: "cp-streetlights", frame: "tl_arm_r_3", duration: 3200 },
          { key: "cp-streetlights", frame: "tl_arm_r_2", duration: 1100 },
        ],
        repeat: -1,
      });
    }
    if (!this.scene.anims.exists("cp-tl-l")) {
      this.scene.anims.create({
        key: "cp-tl-l",
        frames: [
          { key: "cp-streetlights", frame: "tl_arm_l_3", duration: 3200 },
          { key: "cp-streetlights", frame: "tl_arm_l_2", duration: 1100 },
          { key: "cp-streetlights", frame: "tl_arm_l_0", duration: 3200 },
          { key: "cp-streetlights", frame: "tl_arm_l_1", duration: 900 },
        ],
        repeat: -1,
      });
    }
  }

  private tileIdToFrame(tileId: number): string {
    switch (tileId) {
      case TILE.ROAD_PLAIN:
      case TILE.ROAD_CROSS:
        return "road_plain";
      case TILE.ROAD_DASH_H:
        return "road_dash_h";
      case TILE.ROAD_DASH_V:
        return "road_dash_v";
      case TILE.ROAD_YELLOW_H:
        return "road_yellow_h";
      case TILE.ROAD_YELLOW_V:
        return "road_yellow_v";
      case TILE.ROAD_DRAIN:
        return "road_drain";
      case TILE.ROAD_MANHOLE:
        return "road_manhole";
      case TILE.CROSSWALK_H:
        return "crosswalk_h";
      case TILE.CROSSWALK_V:
        return "crosswalk_v";
      case TILE.SIDEWALK_PLAIN:
        return "sidewalk_plain";
      case TILE.SIDEWALK_GRID:
        return "sidewalk_grid";
      case TILE.SIDEWALK_LIGHT:
        return "sidewalk_light";
      case TILE.PLAZA_DARK:
        return "plaza_dark";
      case TILE.PLAZA_MID:
        return "plaza_mid";
      case TILE.PLAZA_LIGHT:
        return "plaza_light";
      case TILE.WATER:
        return "water_plain";
      case TILE.SAND:
        return "sand_plain";
      case TILE.GRASS:
      default:
        return "grass_plain";
    }
  }

  render(locale: "ru" | "ro" = "ru"): void {
    this.registerTextureFrames();
    this.buildingColliders = [];
    this.vehicles = [];
    this.doors = [];

    const height = this.tileMap.length;
    const width = this.tileMap[0]?.length || 0;
    const worldW = width * this.effectiveTileSize;
    const worldH = height * this.effectiveTileSize;

    // 1. Draw the entire ground tilemap onto a single GPU RenderTexture
    const rt = this.scene.add.renderTexture(0, 0, worldW, worldH).setOrigin(0, 0).setDepth(0);
    const stamp = this.scene.make.image({ key: "cp-city", frame: "grass_plain", add: false });
    stamp.setOrigin(0, 0).setScale(this.scale);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const frame = this.tileIdToFrame(this.tileMap[y][x]);
        stamp.setFrame(frame);
        rt.draw(stamp, x * this.effectiveTileSize, y * this.effectiveTileSize);
      }
    }
    stamp.destroy();

    // Add collider for the two park ponds
    this.buildingColliders.push(
      { x: 7 * 32, y: 6.5 * 32, width: 64, height: 32 },
      { x: 43 * 32, y: 6.5 * 32, width: 64, height: 32 },
    );

    // 2. Render buildings (with BL001 window lights & BD001 doors)
    for (const b of CITY_BUILDINGS) {
      const rect = CP_MAIN_FRAMES[b.frame];
      if (!rect) continue;
      const bScale = b.scale ?? 2.2;
      const dispW = rect.w * bScale;
      const dispH = rect.h * bScale;

      if (b.animatedDoor && CP_DOOR_FRAMES[`${b.frame}_d0`]) {
        const doorSprite = this.scene.add
          .sprite(b.x, b.y, "cp-doors", `${b.frame}_d0`)
          .setOrigin(0.5, 1)
          .setScale(bScale)
          .setDepth(b.y);
        this.doors.push({ sprite: doorSprite, baseFrame: b.frame, x: b.x, y: b.y, isOpen: false });
      } else if (b.animatedLight && CP_LIGHT_FRAMES[`${b.frame}_on`]) {
        const animKey = `cp-light-${b.frame}`;
        if (!this.scene.anims.exists(animKey)) {
          this.scene.anims.create({
            key: animKey,
            frames: [
              { key: "cp-lights", frame: `${b.frame}_on`, duration: 4500 },
              { key: "cp-lights", frame: `${b.frame}_off`, duration: 1800 },
            ],
            repeat: -1,
          });
        }
        const lightSprite = this.scene.add
          .sprite(b.x, b.y, "cp-lights", `${b.frame}_on`)
          .setOrigin(0.5, 1)
          .setScale(bScale)
          .setDepth(b.y);
        lightSprite.play({ key: animKey, startFrame: Math.floor(Math.random() * 2) });
      } else {
        this.scene.add
          .image(b.x, b.y, "cp-city", b.frame)
          .setOrigin(0.5, 1)
          .setScale(bScale)
          .setDepth(b.y);
      }

      if (b.label) {
        this.scene.add
          .text(b.x, b.y - dispH - 10, b.label[locale], {
            fontSize: "13px",
            fontStyle: "bold",
            color: "#00d9ff",
            backgroundColor: "#060d1fe6",
            padding: { x: 8, y: 3 },
          })
          .setOrigin(0.5, 1)
          .setDepth(b.y + 2);
      }

      // Solid physics footprint on the lower 55% of the building so rooftops have natural depth overlap
      const colH = Math.max(40, dispH * 0.52);
      this.buildingColliders.push({
        x: b.x,
        y: b.y - colH / 2,
        width: dispW * 0.88,
        height: colH,
      });
    }

    // 3. Render street props, trees, traffic lights, and street lamps
    for (const p of CITY_PROPS) {
      const pScale = p.scale ?? 2.0;
      if (p.kind === "traffic_light_r") {
        this.scene.add
          .sprite(p.x, p.y, "cp-streetlights", "tl_arm_r_0")
          .setOrigin(0.5, 1)
          .setScale(pScale)
          .setDepth(p.y)
          .play("cp-tl-r");
      } else if (p.kind === "traffic_light_l") {
        this.scene.add
          .sprite(p.x, p.y, "cp-streetlights", "tl_arm_l_0")
          .setOrigin(0.5, 1)
          .setScale(pScale)
          .setDepth(p.y)
          .play("cp-tl-l");
      } else if (p.kind === "street_lamp") {
        this.scene.add
          .image(p.x, p.y, "cp-streetlights", p.frame)
          .setOrigin(0.5, 1)
          .setScale(pScale)
          .setDepth(p.y);
      } else {
        this.scene.add
          .image(p.x, p.y, "cp-city", p.frame)
          .setOrigin(0.5, 1)
          .setScale(pScale)
          .setDepth(p.y);
      }
    }

    // 4. Spawn moving ambient vehicles on main roads
    for (const v of CITY_VEHICLES) {
      const sprite = this.scene.add
        .image(v.startX, v.startY, "cp-city", v.frame)
        .setOrigin(0.5, 0.5)
        .setScale(1.85)
        .setFlipX(Boolean(v.flipX))
        .setDepth(v.startY);
      this.vehicles.push({
        sprite,
        startX: v.startX,
        startY: v.startY,
        endX: v.endX,
        endY: v.endY,
        speed: v.speed,
      });
    }
  }

  /** Updates moving vehicles and proximity-activated building doors from BD001.png */
  update(deltaMs: number, playerX: number, playerY: number): void {
    const dt = deltaMs / 1000;
    for (const v of this.vehicles) {
      const dx = v.endX - v.startX;
      const dy = v.endY - v.startY;
      const len = Math.hypot(dx, dy) || 1;
      v.sprite.x += (dx / len) * v.speed * dt;
      v.sprite.y += (dy / len) * v.speed * dt;
      v.sprite.setDepth(v.sprite.y);

      if ((dx > 0 && v.sprite.x > v.endX) || (dx < 0 && v.sprite.x < v.endX) || (dy > 0 && v.sprite.y > v.endY) || (dy < 0 && v.sprite.y < v.endY)) {
        v.sprite.setPosition(v.startX, v.startY);
      }
    }

    // Animate doors in BD001.png when player approaches landmark entrance
    for (const d of this.doors) {
      const dist = Math.hypot(playerX - d.x, playerY - d.y);
      const shouldOpen = dist < 135;
      if (shouldOpen !== d.isOpen) {
        d.isOpen = shouldOpen;
        d.sprite.setFrame(`${d.baseFrame}_${shouldOpen ? "d2" : "d0"}`);
      } else if (dist >= 135 && dist < 175) {
        d.sprite.setFrame(`${d.baseFrame}_d1`);
      }
    }
  }
}
