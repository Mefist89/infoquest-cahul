import Phaser from "phaser";

import { playSound } from "@/features/sound/play-sound";
import {
  CITY_BUILDINGS,
  MISSION_NPCS,
  PARK_TREES,
  STREET_STARS,
  WORLD_H,
  WORLD_W,
  createInitialCars,
  type MissionId,
  type MissionNpc,
} from "../city-map-data";
import { escapeLabCopy, type EscapeLocale } from "../escape-lab-copy";
import { ensureEscapePhaserTextures } from "./phaser-textures";

export type CityBridge = {
  locale: EscapeLocale;
  initialPos: { x: number; y: number };
  completedMissions: ReadonlySet<MissionId>;
  collectedStars: ReadonlySet<string>;
  bossUnlocked: boolean;
  onNearbyNpcChange: (npc: MissionNpc | null) => void;
  onPlayerMove: (pos: { x: number; y: number }) => void;
  onCollectStar: (starId: string) => void;
  onStartMission: (id: MissionId) => void;
  onBossLockedHit: () => void;
};

type CarSpriteEntry = {
  sprite: Phaser.Physics.Arcade.Image;
  axis: "h" | "v";
  dir: 1 | -1;
  speed: number;
};

type NpcVisualEntry = {
  npc: MissionNpc;
  sprite: Phaser.GameObjects.Image;
  ring: Phaser.GameObjects.Arc;
  badgeBg: Phaser.GameObjects.Rectangle;
  badgeTxt: Phaser.GameObjects.Text;
  nameTxt: Phaser.GameObjects.Text;
};

const PLAYER_SPEED = 220;
const NPC_INTERACT_DIST = 82;
const FOUNTAIN_X = 630;
const FOUNTAIN_Y = 425;

function hexNum(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export class CityScene extends Phaser.Scene {
  private bridge: CityBridge;
  private player!: Phaser.Physics.Arcade.Image;
  private compass!: Phaser.GameObjects.Image;
  private targetRing!: Phaser.GameObjects.Arc;
  private walkTarget: { x: number; y: number } | null = null;
  private dpad = { dx: 0, dy: 0 };
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    e: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    enter: Phaser.Input.Keyboard.Key;
  };
  private cars: CarSpriteEntry[] = [];
  private starSprites = new Map<string, Phaser.Physics.Arcade.Image>();
  private npcVisuals: NpcVisualEntry[] = [];
  private buildingGraphics!: Phaser.GameObjects.Graphics;
  private buildingLabels: {
    missionId?: MissionId;
    labelRu?: string;
    labelRo?: string;
    trimColor: string;
    bx: number;
    by: number;
    bw: number;
    bh: number;
    text: Phaser.GameObjects.Text;
  }[] = [];
  private fountainRipple!: Phaser.GameObjects.Arc;
  private radarGraphics!: Phaser.GameObjects.Graphics;
  private radarTitle!: Phaser.GameObjects.Text;
  private nearbyNpcId: MissionId | null = null;
  private bumpCooldown = 0;
  private elapsed = 0;
  private ready = false;

  constructor(bridge: CityBridge) {
    super({ key: "CityScene" });
    this.bridge = bridge;
  }

  create() {
    const initialCars = createInitialCars();
    ensureEscapePhaserTextures(this, initialCars);

    this.physics.world.setBounds(20, 20, WORLD_W - 40, WORLD_H - 40);

    // 1. Static Ground, Roads, Central Park, Crosswalks
    this.drawCityGround();

    // Animated fountain water ripple
    this.fountainRipple = this.add.circle(FOUNTAIN_X, FOUNTAIN_Y, 10, 0x000000, 0);
    this.fountainRipple.setStrokeStyle(2.5, 0x7dd3fc, 0.85);
    this.fountainRipple.setDepth(5);

    // 2. Invisible Arcade Physics static colliders for buildings + fountain
    const colliders = this.physics.add.staticGroup();
    for (const b of CITY_BUILDINGS) {
      const zone = this.add.rectangle(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h, 0x000000, 0);
      this.physics.add.existing(zone, true);
      colliders.add(zone);
    }
    const fountainBox = this.add.rectangle(FOUNTAIN_X, FOUNTAIN_Y, 56, 56, 0x000000, 0);
    this.physics.add.existing(fountainBox, true);
    colliders.add(fountainBox);

    // 3. Tap-to-walk target marker
    this.targetRing = this.add.circle(0, 0, 12, 0x00d9ff, 0.15);
    this.targetRing.setStrokeStyle(2.5, 0x00d9ff, 0.9);
    this.targetRing.setVisible(false);
    this.targetRing.setDepth(8);

    // 4. Collectible Street Stars (Phaser Arcade Physics + Tweens)
    const starsGroup = this.physics.add.staticGroup();
    for (const st of STREET_STARS) {
      if (this.bridge.collectedStars.has(st.id)) continue;
      const spr = this.physics.add.staticImage(st.x, st.y, "star-gold");
      spr.setDepth(14);
      spr.setData("starId", st.id);
      starsGroup.add(spr);
      this.starSprites.set(st.id, spr);

      this.tweens.add({
        targets: spr,
        y: st.y - 5,
        angle: 360,
        duration: 2400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // 5. Moving Retro Traffic Cars
    const carsGroup = this.physics.add.group({ allowGravity: false });
    initialCars.forEach((c, idx) => {
      const spr = this.physics.add.image(c.x, c.y, `traffic-car-${idx}`);
      spr.setDepth(18);
      spr.setImmovable(true);
      spr.setBodySize(c.w - 4, c.h - 4);
      carsGroup.add(spr);
      this.cars.push({ sprite: spr, axis: c.axis, dir: c.dir, speed: c.speed });
    });

    // 6. Mission NPCs with pulsing halos, badges & click handlers
    for (const npc of MISSION_NPCS) {
      const ring = this.add.circle(npc.x, npc.y, 26, hexNum(npc.color), 0.12);
      ring.setStrokeStyle(3, hexNum(npc.color), 0.85);
      ring.setDepth(15);

      const sprite = this.add.image(npc.x, npc.y, `npc-top-${npc.missionId}`);
      sprite.setDepth(20);
      sprite.setInteractive({ useHandCursor: true });
      sprite.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event?.stopPropagation();
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
        if (dist <= NPC_INTERACT_DIST + 18) {
          this.tryTriggerNpc(npc);
        } else {
          this.guideToNpc(npc.missionId);
        }
      });

      const badgeBg = this.add.rectangle(npc.x, npc.y - 32, 26, 22, 0xfacc15, 1);
      badgeBg.setStrokeStyle(2, 0x0f172a, 1);
      badgeBg.setDepth(42);

      const badgeTxt = this.add
        .text(npc.x, npc.y - 32, "!", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          fontStyle: "900",
          color: "#0f172a",
        })
        .setOrigin(0.5)
        .setDepth(43);

      const nameTxt = this.add
        .text(npc.x, npc.y + 24, this.bridge.locale === "ro" ? npc.nameRo : npc.nameRu, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          fontStyle: "800",
          color: "#f8fafc",
          backgroundColor: "#090f20",
          padding: { x: 6, y: 2 },
        })
        .setOrigin(0.5)
        .setDepth(43);

      this.tweens.add({
        targets: [badgeBg, badgeTxt],
        y: npc.y - 38,
        duration: 850,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.npcVisuals.push({ npc, sprite, ring, badgeBg, badgeTxt, nameTxt });
    }

    // 7. Player Detective (Arcade Physics)
    this.player = this.physics.add.image(
      this.bridge.initialPos.x,
      this.bridge.initialPos.y,
      "detective-top",
    );
    this.player.setDepth(24);
    this.player.setCollideWorldBounds(true);
    this.player.setCircle(14, 6, 6);
    this.player.setRotation(-Math.PI / 2);

    // Orbiting Mission Compass Arrow
    this.compass = this.add.image(this.player.x, this.player.y - 34, "compass-arrow");
    this.compass.setDepth(45);

    // Collisions & Overlaps
    this.physics.add.collider(this.player, colliders, () => {
      this.walkTarget = null;
      this.targetRing.setVisible(false);
    });

    this.physics.add.overlap(this.player, starsGroup, (_p, starObj) => {
      const spr = starObj as Phaser.Physics.Arcade.Image;
      const starId = spr.getData("starId") as string | undefined;
      if (!starId || !spr.active) return;
      const sx = spr.x;
      const sy = spr.y;
      spr.destroy();
      this.starSprites.delete(starId);
      playSound("correct");
      this.spawnSparks(sx, sy, 0xffd166, 14);
      this.floatText(sx, sy - 10, "+1 ★", "#ffd166");
      this.bridge.onCollectStar(starId);
    });

    this.physics.add.overlap(this.player, carsGroup, (_p, carObj) => {
      if (this.bumpCooldown > 0) return;
      const car = this.cars.find((c) => c.sprite === carObj);
      if (!car) return;
      this.bumpCooldown = 0.7;
      this.walkTarget = null;
      this.targetRing.setVisible(false);

      const pushX = car.axis === "v" ? (this.player.x >= car.sprite.x ? 28 : -28) : 0;
      const pushY = car.axis === "h" ? (this.player.y >= car.sprite.y ? 28 : -28) : 0;
      this.player.setPosition(
        clamp(this.player.x + pushX, 34, WORLD_W - 34),
        clamp(this.player.y + pushY, 34, WORLD_H - 34),
      );

      this.cameras.main.shake(150, 0.006);
      this.spawnSparks(this.player.x, this.player.y, 0xfb7185, 12);
      playSound("wrong");
      this.floatText(
        this.player.x,
        this.player.y - 24,
        this.bridge.locale === "ro" ? "Atenție!" : "Осторожно!",
        "#fb7185",
      );
    });

    // 8. Retro 3D-Offset Building Rooftops + Park Trees (rendered above street level!)
    this.buildingGraphics = this.add.graphics();
    this.buildingGraphics.setDepth(32);

    for (const b of CITY_BUILDINGS) {
      const label = this.bridge.locale === "ro" ? b.labelRo : b.labelRu;
      const text = this.add
        .text(b.x + b.w / 2, b.y + b.h / 2, label ?? "", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "15px",
          fontStyle: "900",
          color: b.trimColor,
          backgroundColor: "#020617cc",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setDepth(36);

      this.buildingLabels.push({
        missionId: b.missionId,
        labelRu: b.labelRu,
        labelRo: b.labelRo,
        trimColor: b.trimColor,
        bx: b.x,
        by: b.y,
        bw: b.w,
        bh: b.h,
        text,
      });
    }

    // Park & Sidewalk Trees
    const treesG = this.add.graphics();
    treesG.setDepth(38);
    for (const [tx, ty, tr] of PARK_TREES) {
      treesG.fillStyle(0x000000, 0.35);
      treesG.fillCircle(tx + 4, ty + 5, tr);
      treesG.fillStyle(0x065f46, 1);
      treesG.fillCircle(tx, ty, tr);
      treesG.fillStyle(0x10b981, 1);
      treesG.fillCircle(tx - tr * 0.22, ty - tr * 0.22, tr * 0.62);
    }

    // 9. GTA-Style Screen-Fixed Corner Mini-Map Radar
    this.radarGraphics = this.add.graphics();
    this.radarGraphics.setScrollFactor(0).setDepth(90);
    this.radarTitle = this.add
      .text(0, 0, escapeLabCopy[this.bridge.locale].city.radarTitle, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        fontStyle: "900",
        color: "#7dd3fc",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(91);

    // 10. Camera smoothly tracks detective
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    // 11. Keyboard & Pointer Tap-to-Walk
    const kb = this.input.keyboard;
    if (kb) {
      this.keys = {
        up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        e: kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        enter: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      };
    }

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (currentlyOver.length > 0) return;
      const wx = clamp(pointer.worldX, 32, WORLD_W - 32);
      const wy = clamp(pointer.worldY, 32, WORLD_H - 32);
      this.walkTarget = { x: wx, y: wy };
      this.targetRing.setPosition(wx, wy).setVisible(true);
    });

    this.ready = true;
    this.refreshVisualLabels();
  }

  public syncBridge(next: Partial<CityBridge>) {
    this.bridge = { ...this.bridge, ...next };
    if (this.ready) {
      // Remove any stars already collected
      for (const id of this.bridge.collectedStars) {
        const spr = this.starSprites.get(id);
        if (spr) {
          spr.destroy();
          this.starSprites.delete(id);
        }
      }
      this.refreshVisualLabels();
    }
  }

  public setDpad(dx: number, dy: number) {
    this.dpad = { dx, dy };
    if (dx !== 0 || dy !== 0) {
      this.walkTarget = null;
      if (this.targetRing) this.targetRing.setVisible(false);
    }
  }

  public guideToNpc(missionId: MissionId) {
    const npc = MISSION_NPCS.find((n) => n.missionId === missionId);
    if (!npc || !this.ready) return;
    const offsetY = npc.y < 400 ? 24 : -24;
    this.walkTarget = { x: npc.x, y: npc.y + offsetY };
    this.targetRing.setPosition(npc.x, npc.y + offsetY).setVisible(true);
    playSound("correct");
  }

  public triggerNearbyMission() {
    if (!this.nearbyNpcId) return;
    const npc = MISSION_NPCS.find((n) => n.missionId === this.nearbyNpcId);
    if (npc) this.tryTriggerNpc(npc);
  }

  private tryTriggerNpc(npc: MissionNpc) {
    if (npc.missionId === 4 && !this.bridge.bossUnlocked) {
      playSound("wrong");
      this.cameras.main.shake(140, 0.005);
      this.bridge.onBossLockedHit();
      return;
    }
    playSound("correct");
    this.bridge.onPlayerMove({ x: this.player.x, y: this.player.y });
    this.bridge.onStartMission(npc.missionId);
  }

  private refreshVisualLabels() {
    const loc = this.bridge.locale;
    this.radarTitle.setText(escapeLabCopy[loc].city.radarTitle);

    for (const nv of this.npcVisuals) {
      const done = this.bridge.completedMissions.has(nv.npc.missionId);
      const locked = nv.npc.missionId === 4 && !this.bridge.bossUnlocked;
      const ringCol = done ? 0x22c55e : locked ? 0xfb7185 : hexNum(nv.npc.color);
      nv.ring.setStrokeStyle(3, ringCol, 0.85);
      nv.badgeBg.setFillStyle(done ? 0x16a34a : locked ? 0xbe123c : 0xfacc15, 1);
      nv.badgeTxt.setText(done ? "✓" : locked ? "🔒" : "!");
      nv.badgeTxt.setColor(done || locked ? "#ffffff" : "#0f172a");
      nv.nameTxt.setText(loc === "ro" ? nv.npc.nameRo : nv.npc.nameRu);
    }
  }

  private drawCityGround() {
    const g = this.add.graphics();
    g.setDepth(1);

    // Sidewalk base
    g.fillStyle(0x1b2438, 1);
    g.fillRect(0, 0, WORLD_W, WORLD_H);

    // Subtle paving grid
    g.lineStyle(1, 0x94a3b8, 0.08);
    for (let x = 0; x <= WORLD_W; x += 32) g.lineBetween(x, 0, x, WORLD_H);
    for (let y = 0; y <= WORLD_H; y += 32) g.lineBetween(0, y, WORLD_W, y);

    // Central Cyber Park
    g.fillStyle(0x0e3a2d, 1);
    g.fillRect(454, 330, 358, 198);
    g.lineStyle(2, 0x34d399, 1);
    g.strokeRect(454, 330, 358, 198);

    // Stone cross walkways
    g.fillStyle(0x26334d, 1);
    g.fillRect(606, 330, 48, 198);
    g.fillRect(454, 405, 358, 40);

    // Fountain basin
    g.fillStyle(0x1e293b, 1);
    g.fillCircle(FOUNTAIN_X, FOUNTAIN_Y, 34);
    g.fillStyle(0x0284c7, 1);
    g.fillCircle(FOUNTAIN_X, FOUNTAIN_Y, 28);
    g.fillStyle(0xe0f2fe, 1);
    g.fillCircle(FOUNTAIN_X, FOUNTAIN_Y, 5);

    // Asphalt avenues
    g.fillStyle(0x111827, 1);
    g.fillRect(0, 246, WORLD_W, 76);
    g.fillRect(0, 536, WORLD_W, 76);
    g.fillRect(370, 0, 76, WORLD_H);
    g.fillRect(820, 0, 76, WORLD_H);

    // Curb borders
    g.lineStyle(2, 0x475569, 1);
    for (const ry of [246, 322, 536, 612]) g.lineBetween(0, ry, WORLD_W, ry);
    for (const rx of [370, 446, 820, 896]) g.lineBetween(rx, 0, rx, WORLD_H);

    // Yellow dashed lane centerlines
    g.fillStyle(0xfacc15, 1);
    for (let x = 8; x < WORLD_W; x += 34) {
      g.fillRect(x, 283, 18, 3);
      g.fillRect(x, 573, 18, 3);
    }
    for (let y = 8; y < WORLD_H; y += 34) {
      g.fillRect(407, y, 3, 18);
      g.fillRect(857, y, 3, 18);
    }

    // White zebra crosswalks
    g.fillStyle(0xe2e8f0, 0.72);
    for (const [ix0, iy0] of [
      [370, 246],
      [820, 246],
      [370, 536],
      [820, 536],
    ] as const) {
      for (let s = 0; s < 5; s += 1) {
        const off = 8 + s * 14;
        g.fillRect(ix0 - 16, iy0 + off, 12, 7);
        g.fillRect(ix0 + 80, iy0 + off, 12, 7);
        g.fillRect(ix0 + off, iy0 - 16, 7, 12);
        g.fillRect(ix0 + off, iy0 + 80, 7, 12);
      }
    }
  }

  private spawnSparks(x: number, y: number, color: number, count: number) {
    const emitter = this.add.particles(x, y, "spark", {
      speed: { min: 60, max: 180 },
      scale: { start: 1, end: 0 },
      lifespan: 450,
      tint: color,
      emitting: false,
    });
    emitter.setDepth(60);
    emitter.explode(count);
    this.time.delayedCall(520, () => emitter.destroy());
  }

  private floatText(x: number, y: number, msg: string, color: string) {
    const txt = this.add
      .text(x, y, msg, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        fontStyle: "900",
        color,
        stroke: "#020617",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(70);

    this.tweens.add({
      targets: txt,
      y: y - 42,
      alpha: 0,
      duration: 950,
      ease: "Cubic.easeOut",
      onComplete: () => txt.destroy(),
    });
  }

  update(_time: number, delta: number) {
    if (!this.ready) return;
    const dt = Math.min(0.05, delta / 1000);
    this.elapsed += dt;
    if (this.bumpCooldown > 0) this.bumpCooldown = Math.max(0, this.bumpCooldown - dt);

    // Fountain ripple animation
    this.fountainRipple.setRadius(8 + ((this.elapsed * 18) % 20));

    // 1. Movement input (keyboard + mobile D-pad + tap-to-walk)
    let ix = this.dpad.dx;
    let iy = this.dpad.dy;
    if (this.keys) {
      if (this.keys.left.isDown || this.keys.a.isDown) ix -= 1;
      if (this.keys.right.isDown || this.keys.d.isDown) ix += 1;
      if (this.keys.up.isDown || this.keys.w.isDown) iy -= 1;
      if (this.keys.down.isDown || this.keys.s.isDown) iy += 1;

      if (
        Phaser.Input.Keyboard.JustDown(this.keys.e) ||
        Phaser.Input.Keyboard.JustDown(this.keys.space) ||
        Phaser.Input.Keyboard.JustDown(this.keys.enter)
      ) {
        this.triggerNearbyMission();
      }
    }

    if (ix !== 0 || iy !== 0) {
      this.walkTarget = null;
      this.targetRing.setVisible(false);
    } else if (this.walkTarget) {
      const dx = this.walkTarget.x - this.player.x;
      const dy = this.walkTarget.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 10) {
        this.walkTarget = null;
        this.targetRing.setVisible(false);
      } else {
        ix = dx / dist;
        iy = dy / dist;
        this.targetRing.setScale(1 + Math.sin(this.elapsed * 6) * 0.18);
      }
    }

    const mag = Math.hypot(ix, iy);
    if (mag > 0.01) {
      this.player.setVelocity((ix / mag) * PLAYER_SPEED, (iy / mag) * PLAYER_SPEED);
      this.player.setRotation(Math.atan2(iy, ix));
    } else {
      this.player.setVelocity(0, 0);
    }

    // 2. Move retro traffic cars along avenues
    for (const c of this.cars) {
      if (c.axis === "h") {
        c.sprite.x += c.dir * c.speed * dt;
        if (c.dir === 1 && c.sprite.x > WORLD_W + 60) c.sprite.x = -60;
        if (c.dir === -1 && c.sprite.x < -60) c.sprite.x = WORLD_W + 60;
      } else {
        c.sprite.y += c.dir * c.speed * dt;
        if (c.dir === 1 && c.sprite.y > WORLD_H + 60) c.sprite.y = -60;
        if (c.dir === -1 && c.sprite.y < -60) c.sprite.y = WORLD_H + 60;
      }
    }

    // 3. NPC Proximity + Halo Pulse
    let closestNpc: MissionNpc | null = null;
    let closestDist = NPC_INTERACT_DIST;
    for (const nv of this.npcVisuals) {
      nv.ring.setScale(1 + Math.sin(this.elapsed * 4.5 + nv.npc.missionId) * 0.14);
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, nv.npc.x, nv.npc.y);
      if (d < closestDist) {
        closestDist = d;
        closestNpc = nv.npc;
      }
    }
    const nextNpcId = closestNpc ? closestNpc.missionId : null;
    if (nextNpcId !== this.nearbyNpcId) {
      this.nearbyNpcId = nextNpcId;
      this.bridge.onNearbyNpcChange(closestNpc);
    }

    // 4. Mission Compass Arrow pointing to nearest unfinished unlocked NPC
    let targetNpc: MissionNpc | null = null;
    let bestD = Infinity;
    for (const npc of MISSION_NPCS) {
      if (this.bridge.completedMissions.has(npc.missionId)) continue;
      if (npc.missionId === 4 && !this.bridge.bossUnlocked) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (d < bestD) {
        bestD = d;
        targetNpc = npc;
      }
    }
    if (targetNpc && bestD > 95) {
      const ang = Math.atan2(targetNpc.y - this.player.y, targetNpc.x - this.player.x);
      this.compass
        .setVisible(true)
        .setPosition(this.player.x + Math.cos(ang) * 34, this.player.y + Math.sin(ang) * 34)
        .setRotation(ang)
        .setTint(targetNpc.missionId === 4 ? 0xfb7185 : 0xffd166);
    } else {
      this.compass.setVisible(false);
    }

    // 5. Render Classic Retro GTA 3D-Offset Building Rooftops
    this.draw3DBuildings();

    // 6. Render GTA-Style Top-Right Mini-Map Radar
    this.drawMiniMapRadar();
  }

  private draw3DBuildings() {
    const g = this.buildingGraphics;
    g.clear();
    const cam = this.cameras.main;
    const camCX = cam.scrollX + cam.width / 2;
    const camCY = cam.scrollY + cam.height / 2;

    CITY_BUILDINGS.forEach((b, idx) => {
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const offX = clamp((cx - camCX) * 0.045, -14, 14);
      const offY = clamp((cy - camCY) * 0.045, -14, 14);
      const rx = b.x + offX;
      const ry = b.y + offY;

      // Extruded walls
      g.fillStyle(hexNum(b.wallColor), 1);
      g.fillRect(b.x, b.y, b.w, b.h);
      g.fillPoints(
        [
          { x: b.x, y: b.y },
          { x: rx, y: ry },
          { x: rx + b.w, y: ry },
          { x: b.x + b.w, y: b.y },
        ],
        true,
      );
      g.fillPoints(
        [
          { x: b.x, y: b.y + b.h },
          { x: rx, y: ry + b.h },
          { x: rx + b.w, y: ry + b.h },
          { x: b.x + b.w, y: b.y + b.h },
        ],
        true,
      );
      g.fillPoints(
        [
          { x: b.x, y: b.y },
          { x: rx, y: ry },
          { x: rx, y: ry + b.h },
          { x: b.x, y: b.y + b.h },
        ],
        true,
      );
      g.fillPoints(
        [
          { x: b.x + b.w, y: b.y },
          { x: rx + b.w, y: ry },
          { x: rx + b.w, y: ry + b.h },
          { x: b.x + b.w, y: b.y + b.h },
        ],
        true,
      );

      const done = b.missionId ? this.bridge.completedMissions.has(b.missionId) : false;
      const locked = b.missionId === 4 && !this.bridge.bossUnlocked;

      // Rooftop
      g.fillStyle(hexNum(b.roofColor), 1);
      g.fillRect(rx, ry, b.w, b.h);
      g.fillStyle(0xffffff, 0.06);
      g.fillRect(rx + 16, ry + 16, b.w - 32, b.h - 32);

      // Neon roof trim
      g.lineStyle(b.missionId ? 3.5 : 2, done ? 0x22c55e : hexNum(b.trimColor), 1);
      g.strokeRect(rx + 1, ry + 1, b.w - 2, b.h - 2);

      // Pulsing red shield around Boss HQ while locked
      if (locked) {
        g.lineStyle(4, 0xfb7185, 0.45 + Math.sin(this.elapsed * 6) * 0.35);
        g.strokeRect(b.x - 6, b.y - 6, b.w + 12, b.h + 12);
      }

      // Keep rooftop neon label aligned with 3D roof offset
      const lbl = this.buildingLabels[idx];
      if (lbl) {
        const raw = this.bridge.locale === "ro" ? lbl.labelRo : lbl.labelRu;
        const formatted = raw ? (done ? `✓ ${raw}` : locked ? `🔒 ${raw}` : raw) : "";
        lbl.text.setPosition(rx + b.w / 2, ry + b.h / 2);
        lbl.text.setText(formatted);
        lbl.text.setColor(done ? "#4ade80" : lbl.trimColor);
      }
    });
  }

  private drawMiniMapRadar() {
    const cam = this.cameras.main;
    const g = this.radarGraphics;
    g.clear();

    const mapW = cam.width < 520 ? 114 : 152;
    const mapH = Math.round((mapW * WORLD_H) / WORLD_W);
    const mx = cam.width - mapW - 12;
    const my = 12;
    const sx = mapW / WORLD_W;
    const sy = mapH / WORLD_H;

    // Frame
    g.fillStyle(0x060d1e, 0.88);
    g.fillRoundedRect(mx - 4, my - 4, mapW + 8, mapH + 22, 10);
    g.lineStyle(2, 0x00d9ff, 0.65);
    g.strokeRoundedRect(mx - 4, my - 4, mapW + 8, mapH + 22, 10);

    // Roads
    g.fillStyle(0x334155, 1);
    g.fillRect(mx, my + 246 * sy, mapW, 76 * sy);
    g.fillRect(mx, my + 536 * sy, mapW, 76 * sy);
    g.fillRect(mx + 370 * sx, my, 76 * sx, mapH);
    g.fillRect(mx + 820 * sx, my, 76 * sx, mapH);

    // Buildings
    for (const b of CITY_BUILDINGS) {
      const col = b.missionId
        ? this.bridge.completedMissions.has(b.missionId)
          ? 0x22c55e
          : hexNum(b.trimColor)
        : 0x475569;
      g.fillStyle(col, b.missionId ? 0.85 : 0.45);
      g.fillRect(mx + b.x * sx, my + b.y * sy, b.w * sx, b.h * sy);
    }

    // Uncollected street stars
    g.fillStyle(0xffd166, 1);
    for (const st of STREET_STARS) {
      if (this.bridge.collectedStars.has(st.id)) continue;
      g.fillRect(mx + st.x * sx - 1.5, my + st.y * sy - 1.5, 3, 3);
    }

    // Pulsing mission NPC blips
    for (const npc of MISSION_NPCS) {
      const done = this.bridge.completedMissions.has(npc.missionId);
      const locked = npc.missionId === 4 && !this.bridge.bossUnlocked;
      const r = done ? 3 : 3.8 + Math.sin(this.elapsed * 6) * 0.9;
      g.fillStyle(done ? 0x4ade80 : locked ? 0xfb7185 : 0xfacc15, 1);
      g.fillCircle(mx + npc.x * sx, my + npc.y * sy, r);
    }

    // Player cyan dot
    g.fillStyle(0x00d9ff, 1);
    g.lineStyle(1.5, 0xffffff, 1);
    g.fillCircle(mx + this.player.x * sx, my + this.player.y * sy, 4);
    g.strokeCircle(mx + this.player.x * sx, my + this.player.y * sy, 4);

    this.radarTitle.setPosition(mx + mapW / 2, my + mapH + 10);
  }
}
