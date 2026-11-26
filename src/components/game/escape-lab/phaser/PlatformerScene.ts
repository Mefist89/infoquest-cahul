import Phaser from "phaser";

import { playSound } from "@/features/sound/play-sound";
import type { MissionId } from "../city-map-data";
import { escapeLabCopy, type EscapeLocale } from "../escape-lab-copy";
import { PLATFORMER_LEVELS, type PlatformerLevel } from "../platformer-levels";
import { ensureEscapePhaserTextures } from "./phaser-textures";

export type PlatformerBridge = {
  locale: EscapeLocale;
  missionId: MissionId;
  onCluesChange: (clues: string[]) => void;
  onHeartsChange: (hearts: number) => void;
  onStatusBanner: (msg: string) => void;
  onReadyForPuzzle: () => void;
};

type MovingPlatEntry = {
  rect: Phaser.GameObjects.Rectangle;
  body: Phaser.Physics.Arcade.Body;
  baseX: number;
  baseY: number;
  dx: number;
  dy: number;
  speed: number;
  prevX: number;
  prevY: number;
};

type BotEntry = {
  sprite: Phaser.Physics.Arcade.Image;
  minX: number;
  maxX: number;
  speed: number;
  dir: 1 | -1;
};

type LaserEntry = {
  x: number;
  y: number;
  w: number;
  h: number;
  period: number;
  phaseOffset: number;
  beam: Phaser.GameObjects.Rectangle;
  zone: Phaser.GameObjects.Zone;
};

type ClueEntry = {
  id: string;
  x: number;
  y: number;
  container: Phaser.GameObjects.Container;
  collected: boolean;
};

const MOVE_SPEED = 275;
const JUMP_V = -565;
const DOUBLE_JUMP_V = -525;
const SPRING_V = -770;
const STOMP_BOUNCE_V = -440;

function hexNum(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16);
}

export class PlatformerScene extends Phaser.Scene {
  private bridge: PlatformerBridge;
  private level: PlatformerLevel;
  private player!: Phaser.Physics.Arcade.Image;
  private checkpointFlag!: Phaser.GameObjects.Image;
  private npcBadgeBg!: Phaser.GameObjects.Rectangle;
  private npcBadgeTxt!: Phaser.GameObjects.Text;
  private radarArrow!: Phaser.GameObjects.Image;
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };
  private touchControls = { left: false, right: false };
  private jumpQueued = 0;
  private coyote = 0;
  private jumpsLeft = 2;
  private invuln = 0;
  private hearts = 3;
  private checkpointReached = false;
  private respawn = { x: 70, y: 360 };
  private won = false;
  private radarActive = false;
  private npcRemindCooldown = 0;
  private elapsed = 0;

  private movingPlats: MovingPlatEntry[] = [];
  private bots: BotEntry[] = [];
  private lasers: LaserEntry[] = [];
  private clues: ClueEntry[] = [];
  private collectedIds = new Set<string>();
  private ready = false;

  constructor(bridge: PlatformerBridge) {
    super({ key: "PlatformerScene" });
    this.bridge = bridge;
    this.level = PLATFORMER_LEVELS[bridge.missionId];
    this.respawn = { ...this.level.spawn };
  }

  create() {
    const lv = this.level;
    ensureEscapePhaserTextures(this);

    this.physics.world.setBounds(0, -120, lv.worldW, lv.worldH + 260);
    this.physics.world.gravity.y = 1520;

    // 1. Background gradient + Parallax Detective Skyline + Cyber Grid
    this.drawBackground(lv);

    // 2. Static Platforms
    const staticPlatforms = this.physics.add.staticGroup();
    const platG = this.add.graphics().setDepth(5);
    for (const p of lv.platforms) {
      platG.fillStyle(hexNum(lv.platformFill), 1);
      platG.fillRoundedRect(p.x, p.y, p.w, p.h, p.style === "floor" ? 4 : 7);
      platG.fillStyle(hexNum(lv.platformTop), 1);
      platG.fillRect(p.x + 2, p.y, p.w - 4, 5);
      platG.lineStyle(1.5, 0xffffff, 0.14);
      platG.strokeRect(p.x, p.y, p.w, p.h);

      const zone = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, 0x000000, 0);
      this.physics.add.existing(zone, true);
      staticPlatforms.add(zone);
    }

    // 3. Moving Lift Platforms
    const movingGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const mp of lv.movingPlatforms) {
      const rect = this.add.rectangle(
        mp.x + mp.w / 2,
        mp.y + mp.h / 2,
        mp.w,
        mp.h,
        0x1e293b,
        1,
      );
      rect.setStrokeStyle(2, 0xffd166, 1);
      rect.setDepth(8);
      this.physics.add.existing(rect, false);
      const body = rect.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      movingGroup.add(rect);

      this.movingPlats.push({
        rect,
        body,
        baseX: mp.x + mp.w / 2,
        baseY: mp.y + mp.h / 2,
        dx: mp.dx,
        dy: mp.dy,
        speed: mp.speed,
        prevX: mp.x + mp.w / 2,
        prevY: mp.y + mp.h / 2,
      });
    }

    // 4. Bounce Springs
    const springsGroup = this.physics.add.staticGroup();
    for (const sp of lv.springs) {
      const spr = this.physics.add.staticImage(sp.x + sp.w / 2, sp.y + 8, "spring-pad");
      spr.setDepth(10);
      springsGroup.add(spr);
    }

    // 5. Checkpoint Flag
    this.checkpointFlag = this.add
      .image(lv.checkpoint.x + 14, lv.checkpoint.y + 26, "flag-idle")
      .setDepth(10);

    // 6. Pulsing Lasers
    for (const lz of lv.lasers) {
      const emitG = this.add.graphics().setDepth(11);
      emitG.fillStyle(0x334155, 1);
      emitG.fillRect(lz.x - 4, lz.y - 6, lz.w + 8, 8);
      emitG.fillRect(lz.x - 4, lz.y + lz.h - 2, lz.w + 8, 8);

      const beam = this.add
        .rectangle(lz.x + lz.w / 2, lz.y + lz.h / 2, lz.w, lz.h, 0xfb7185, 0.9)
        .setDepth(10);
      const zone = this.add.zone(lz.x + lz.w / 2, lz.y + lz.h / 2, lz.w, lz.h);
      this.physics.add.existing(zone, true);

      this.lasers.push({ ...lz, beam, zone });
    }

    // 7. Collectible Detective Clues (3 per level)
    for (const c of lv.clues) {
      const glow = this.add.circle(0, 0, 21, 0xffd166, 0.22);
      const ring = this.add.circle(0, 0, 17, 0x000000, 0).setStrokeStyle(2.5, 0xffd166, 1);
      const emoji = this.add
        .text(0, 1, c.emoji, { fontSize: "19px", fontFamily: "system-ui, sans-serif" })
        .setOrigin(0.5);
      const container = this.add.container(c.x, c.y, [glow, ring, emoji]).setDepth(16);

      this.tweens.add({
        targets: container,
        y: c.y - 7,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.clues.push({ id: c.id, x: c.x, y: c.y, container, collected: false });
    }

    // 8. Patrol Virus Bots
    const botsGroup = this.physics.add.group({ allowGravity: false });
    for (const b of lv.bots) {
      const spr = this.physics.add.image(b.x, b.y, "bot-virus");
      spr.setDepth(18);
      spr.setBodySize(26, 22);
      botsGroup.add(spr);
      this.bots.push({ sprite: spr, minX: b.minX, maxX: b.maxX, speed: b.speed, dir: 1 });
    }

    // 9. Target NPC at the right end of the level
    const nx = lv.npc.x;
    const ny = lv.npc.y;
    this.add.ellipse(nx, ny + 50, 64, 16, hexNum(lv.npc.accent), 0.25).setDepth(9);
    this.add.image(nx, ny + 26, `npc-side-${lv.missionId}`).setDepth(17);

    this.npcBadgeBg = this.add
      .rectangle(nx, ny - 20, 56, 24, 0xfacc15, 1)
      .setStrokeStyle(2, 0x0f172a, 1)
      .setDepth(25);
    this.npcBadgeTxt = this.add
      .text(nx, ny - 20, "0/3 🔍", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "900",
        color: "#0f172a",
      })
      .setOrigin(0.5)
      .setDepth(26);

    this.add
      .text(nx, ny - 44, this.bridge.locale === "ro" ? lv.npc.nameRo : lv.npc.nameRu, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "900",
        color: "#f8fafc",
        stroke: "#020617",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(26);

    this.tweens.add({
      targets: [this.npcBadgeBg, this.npcBadgeTxt],
      y: ny - 26,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // 10. Player Detective (Arcade Physics)
    this.player = this.physics.add.image(lv.spawn.x, lv.spawn.y, "detective-side");
    this.player.setDepth(22);
    this.player.setBodySize(24, 38);
    this.player.setOffset(5, 3);
    this.player.setCollideWorldBounds(false);

    // Golden Clue Radar Arrow (activated on Hint or early NPC visit)
    this.radarArrow = this.add
      .image(this.player.x, this.player.y - 34, "compass-arrow")
      .setDepth(35)
      .setVisible(false);

    // Colliders & Overlaps
    this.physics.add.collider(this.player, staticPlatforms);
    this.physics.add.collider(this.player, movingGroup);

    this.physics.add.overlap(this.player, springsGroup, (_p, spObj) => {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (body.velocity.y < 0) return;
      body.setVelocityY(SPRING_V);
      this.jumpsLeft = 1;
      playSound("correct");
      const sp = spObj as Phaser.Physics.Arcade.Image;
      this.tweens.add({ targets: sp, scaleY: 0.55, duration: 90, yoyo: true });
      this.cameras.main.shake(90, 0.003);
      this.spawnSparks(sp.x, sp.y - 4, 0xfacc15, 12);
    });

    this.physics.add.overlap(this.player, botsGroup, (_p, botObj) => {
      if (this.won) return;
      const botSpr = botObj as Phaser.Physics.Arcade.Image;
      if (!botSpr.active) return;
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      const stomping = body.velocity.y > 40 && this.player.y + 12 < botSpr.y;

      if (stomping) {
        const bx = botSpr.x;
        const by = botSpr.y;
        botSpr.destroy();
        this.bots = this.bots.filter((b) => b.sprite !== botSpr);
        body.setVelocityY(STOMP_BOUNCE_V);
        this.jumpsLeft = 1;
        playSound("correct");
        this.cameras.main.shake(120, 0.005);
        this.spawnSparks(bx, by, 0xf43f5e, 16);
        this.floatText(bx, by - 16, escapeLabCopy[this.bridge.locale].platformer.stompWord, "#ffd166");
      } else {
        this.hurtPlayer(false);
      }
    });

    // 11. Camera follows detective horizontally & scales vertically to fit any screen
    this.cameras.main.setBounds(0, 0, lv.worldW, lv.worldH);
    this.cameras.main.startFollow(this.player, true, 0.14, 0.1);
    this.applyResponsiveZoom();
    this.scale.on("resize", this.applyResponsiveZoom, this);

    // 12. Keyboard bindings
    const kb = this.input.keyboard;
    if (kb) {
      this.keys = {
        left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      };
    }

    this.ready = true;
  }

  public setTouchControls(left: boolean, right: boolean) {
    this.touchControls = { left, right };
  }

  public queueJump() {
    this.jumpQueued = 0.14;
  }

  public activateHintRadar() {
    this.radarActive = true;
  }

  public setLocale(locale: EscapeLocale) {
    this.bridge.locale = locale;
  }

  private applyResponsiveZoom() {
    if (!this.cameras?.main) return;
    const zoom = Math.max(0.55, this.scale.height / this.level.worldH);
    this.cameras.main.setZoom(zoom);
  }

  private drawBackground(lv: PlatformerLevel) {
    const bg = this.add.graphics().setScrollFactor(0).setDepth(0);
    bg.fillGradientStyle(
      hexNum(lv.bgTop),
      hexNum(lv.bgTop),
      hexNum(lv.bgBottom),
      hexNum(lv.bgBottom),
      1,
    );
    bg.fillRect(-600, -400, 2800, 1400);

    // Parallax building silhouettes
    const sky = this.add.graphics().setScrollFactor(0.35, 0).setDepth(1);
    for (let i = 0; i < 14; i += 1) {
      const bx = i * 165;
      const bh = 115 + (i % 4) * 52;
      sky.fillStyle(0xffffff, 0.045);
      sky.fillRect(bx, lv.worldH - bh - 36, 98, bh);
      sky.fillStyle(hexNum(lv.accent), 0.14);
      for (let wy = 0; wy < 3; wy += 1) {
        sky.fillRect(bx + 14, lv.worldH - bh - 20 + wy * 28, 22, 14);
        sky.fillRect(bx + 56, lv.worldH - bh - 20 + wy * 28, 22, 14);
      }
    }

    // Subtle cyber grid
    const grid = this.add.graphics().setDepth(2);
    grid.lineStyle(1, hexNum(lv.accent), 0.09);
    for (let gx = 0; gx <= lv.worldW; gx += 64) {
      grid.lineBetween(gx, 0, gx, lv.worldH);
    }
  }

  private spawnSparks(x: number, y: number, color: number, count: number) {
    const emitter = this.add.particles(x, y, "spark", {
      speed: { min: 70, max: 210 },
      scale: { start: 1, end: 0 },
      gravityY: 380,
      lifespan: 480,
      tint: color,
      emitting: false,
    });
    emitter.setDepth(40);
    emitter.explode(count);
    this.time.delayedCall(540, () => emitter.destroy());
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
      .setDepth(45);

    this.tweens.add({
      targets: txt,
      y: y - 42,
      alpha: 0,
      duration: 950,
      ease: "Cubic.easeOut",
      onComplete: () => txt.destroy(),
    });
  }

  private hurtPlayer(fallRespawn: boolean) {
    if (this.invuln > 0 && !fallRespawn) return;
    playSound("wrong");
    this.cameras.main.shake(170, 0.008);
    this.cameras.main.flash(140, 225, 29, 72);
    this.spawnSparks(this.player.x, this.player.y, 0xfb7185, 14);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.hearts -= 1;
    if (this.hearts <= 0 || fallRespawn) {
      if (this.hearts <= 0) this.hearts = 3;
      this.player.setPosition(this.respawn.x, this.respawn.y - 16);
      body.setVelocity(0, 0);
    } else {
      body.setVelocity(this.player.flipX ? 190 : -190, -340);
    }

    this.invuln = 1.25;
    this.bridge.onHeartsChange(this.hearts);
  }

  update(_time: number, delta: number) {
    if (!this.ready) return;
    const dt = Math.min(0.045, delta / 1000);
    this.elapsed += dt;

    const lv = this.level;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const copy = escapeLabCopy[this.bridge.locale].platformer;

    // 1. Update Moving Platforms & carry player when standing on one
    for (const mp of this.movingPlats) {
      mp.prevX = mp.rect.x;
      mp.prevY = mp.rect.y;
      const wave = 0.5 - 0.5 * Math.cos(this.elapsed * mp.speed);
      const nx = mp.baseX + mp.dx * wave;
      const ny = mp.baseY + mp.dy * wave;
      mp.rect.setPosition(nx, ny);
      mp.body.updateFromGameObject();

      const dx = nx - mp.prevX;
      const dy = ny - mp.prevY;
      const standingOn =
        body.blocked.down &&
        Math.abs(this.player.y + 20 - (ny - mp.rect.height / 2)) < 14 &&
        Math.abs(this.player.x - nx) < mp.rect.width / 2 + 12;
      if (standingOn) {
        this.player.x += dx;
        this.player.y += dy;
      }
    }

    // 2. Player Controls & Physics
    if (!this.won) {
      let dir = (this.touchControls.right ? 1 : 0) - (this.touchControls.left ? 1 : 0);
      if (this.keys) {
        if (this.keys.left.isDown || this.keys.a.isDown) dir -= 1;
        if (this.keys.right.isDown || this.keys.d.isDown) dir += 1;
        if (
          Phaser.Input.Keyboard.JustDown(this.keys.up) ||
          Phaser.Input.Keyboard.JustDown(this.keys.w) ||
          Phaser.Input.Keyboard.JustDown(this.keys.space)
        ) {
          this.jumpQueued = 0.14;
        }
      }

      if (dir !== 0) {
        const clampedDir = dir > 0 ? 1 : -1;
        body.setVelocityX(clampedDir * MOVE_SPEED);
        this.player.setFlipX(clampedDir < 0);
      } else {
        body.setVelocityX(body.velocity.x * Math.pow(0.0008, dt));
        if (Math.abs(body.velocity.x) < 10) body.setVelocityX(0);
      }

      // Clamp horizontally inside world
      if (this.player.x < 16) this.player.x = 16;
      if (this.player.x > lv.worldW - 16) this.player.x = lv.worldW - 16;

      if (body.blocked.down || body.touching.down) {
        this.coyote = 0.11;
        this.jumpsLeft = 2;
      } else if (this.coyote > 0) {
        this.coyote = Math.max(0, this.coyote - dt);
      }

      if (this.jumpQueued > 0) {
        this.jumpQueued = Math.max(0, this.jumpQueued - dt);
        if (this.coyote > 0) {
          body.setVelocityY(JUMP_V);
          this.coyote = 0;
          this.jumpsLeft = 1;
          this.jumpQueued = 0;
          this.spawnSparks(this.player.x, this.player.y + 18, hexNum(lv.accent), 6);
          this.tweens.add({ targets: this.player, scaleX: 0.88, scaleY: 1.14, duration: 90, yoyo: true });
        } else if (this.jumpsLeft > 0) {
          body.setVelocityY(DOUBLE_JUMP_V);
          this.jumpsLeft -= 1;
          this.jumpQueued = 0;
          this.spawnSparks(this.player.x, this.player.y + 18, 0xffd166, 9);
          this.tweens.add({ targets: this.player, scaleX: 0.85, scaleY: 1.18, duration: 90, yoyo: true });
        }
      }

      // Invulnerability blink
      if (this.invuln > 0) {
        this.invuln = Math.max(0, this.invuln - dt);
        this.player.setAlpha(Math.floor(this.elapsed * 16) % 2 === 0 ? 0.35 : 1);
      } else {
        this.player.setAlpha(1);
      }

      if (this.npcRemindCooldown > 0) {
        this.npcRemindCooldown = Math.max(0, this.npcRemindCooldown - dt);
      }

      // Pit fall check
      if (this.player.y > lv.worldH + 70) {
        this.hurtPlayer(true);
      }

      // 3. Checkpoint Flag
      if (
        !this.checkpointReached &&
        Math.abs(this.player.x - lv.checkpoint.x) < 36 &&
        Math.abs(this.player.y - (lv.checkpoint.y + 26)) < 58
      ) {
        this.checkpointReached = true;
        this.respawn = { x: lv.checkpoint.x, y: lv.checkpoint.y };
        this.checkpointFlag.setTexture("flag-done");
        playSound("correct");
        this.spawnSparks(lv.checkpoint.x, lv.checkpoint.y, 0x22c55e, 16);
        this.floatText(lv.checkpoint.x, lv.checkpoint.y - 16, "CHECKPOINT! 🚩", "#4ade80");
        this.bridge.onStatusBanner(copy.checkpointToast);
      }

      // 4. Collectible Detective Clues
      for (const clue of this.clues) {
        if (clue.collected) continue;
        const d = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          clue.container.x,
          clue.container.y,
        );
        if (d < 34) {
          clue.collected = true;
          clue.container.destroy();
          this.collectedIds.add(clue.id);
          playSound("correct");
          this.spawnSparks(clue.x, clue.y, 0xffd166, 18);
          this.floatText(clue.x, clue.y - 16, copy.foundClueWord, "#ffd166");
          const list = Array.from(this.collectedIds);
          this.bridge.onCluesChange(list);

          const allFound = list.length >= lv.clues.length;
          this.npcBadgeBg.setFillStyle(allFound ? 0x22c55e : 0xfacc15, 1);
          this.npcBadgeTxt.setText(allFound ? "✓ GO!" : `${list.length}/3 🔍`);
          if (allFound) {
            this.bridge.onStatusBanner(copy.allCluesReady);
          }
        }
      }

      // 5. Pulsing Lasers
      for (const lz of this.lasers) {
        const cycle = (this.elapsed + lz.phaseOffset) % lz.period;
        const active = cycle < lz.period * 0.46;
        const warning = !active && cycle > lz.period * 0.8;
        if (active) {
          lz.beam.setVisible(true).setAlpha(0.95).setFillStyle(0xfb7185, 0.95);
          if (
            Math.abs(this.player.x - (lz.x + lz.w / 2)) < lz.w / 2 + 10 &&
            this.player.y + 16 > lz.y &&
            this.player.y - 16 < lz.y + lz.h
          ) {
            this.hurtPlayer(false);
          }
        } else if (warning) {
          lz.beam.setVisible(true).setAlpha(0.32).setFillStyle(0xfda4af, 0.45);
        } else {
          lz.beam.setVisible(false);
        }
      }

      // 6. Patrol Virus Bots
      for (const b of this.bots) {
        if (!b.sprite.active) continue;
        b.sprite.x += b.dir * b.speed * dt;
        if (b.sprite.x <= b.minX) {
          b.sprite.x = b.minX;
          b.dir = 1;
          b.sprite.setFlipX(false);
        } else if (b.sprite.x >= b.maxX) {
          b.sprite.x = b.maxX;
          b.dir = -1;
          b.sprite.setFlipX(true);
        }
      }

      // 7. Reaching Target NPC
      const npcDist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        lv.npc.x,
        lv.npc.y + 22,
      );
      if (npcDist < 54) {
        if (this.collectedIds.size >= lv.clues.length) {
          this.won = true;
          body.setVelocity(0, 0);
          playSound("correct");
          this.spawnSparks(lv.npc.x, lv.npc.y, 0x22c55e, 28);
          this.spawnSparks(this.player.x, this.player.y - 10, 0xffd166, 22);
          this.bridge.onStatusBanner(copy.reachedNpcTitle);
          this.bridge.onReadyForPuzzle();
        } else if (this.npcRemindCooldown <= 0) {
          this.npcRemindCooldown = 2.4;
          playSound("wrong");
          this.radarActive = true;
          this.bridge.onStatusBanner(copy.needMoreClues(lv.clues.length - this.collectedIds.size));
        }
      }

      // 8. Golden Clue Radar Arrow
      if (this.radarActive) {
        let tx = lv.npc.x;
        let ty = lv.npc.y;
        let bestDist = Infinity;
        for (const clue of this.clues) {
          if (clue.collected) continue;
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, clue.x, clue.y);
          if (d < bestDist) {
            bestDist = d;
            tx = clue.x;
            ty = clue.y;
          }
        }
        const ang = Math.atan2(ty - this.player.y, tx - this.player.x);
        this.radarArrow
          .setVisible(true)
          .setPosition(this.player.x + Math.cos(ang) * 34, this.player.y + Math.sin(ang) * 34)
          .setRotation(ang);
      } else {
        this.radarArrow.setVisible(false);
      }
    }
  }
}
