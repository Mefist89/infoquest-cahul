import * as Phaser from "phaser";

import { PATROL_NPCS } from "@/data/patrol";

export type PatrolLocale = "ru" | "ro";

export type PatrolHooks = {
  onTalk: (npcId: string) => void;
};

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1200;
const PLAYER_SPEED = 260;
const TALK_DISTANCE = 100;

type District = {
  id: string;
  name: { ru: string; ro: string };
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
};

const DISTRICTS: District[] = [
  { id: "school", name: { ru: "Школа", ro: "Școala" }, x: 140, y: 140, width: 420, height: 300, color: 0x1d4ed8 },
  { id: "bank", name: { ru: "Банк", ro: "Banca" }, x: 1040, y: 140, width: 420, height: 300, color: 0x047857 },
  { id: "post", name: { ru: "Почта", ro: "Poșta" }, x: 140, y: 760, width: 420, height: 300, color: 0xb45309 },
  { id: "shop", name: { ru: "Магазин", ro: "Magazinul" }, x: 1040, y: 760, width: 420, height: 300, color: 0xbe185d },
];

type NpcRecord = {
  id: string;
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  checkText: Phaser.GameObjects.Text;
  resolved: boolean;
};

export class PatrolScene extends Phaser.Scene {
  private locale: PatrolLocale;
  private hooks: PatrolHooks;
  private player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private talkKey?: Phaser.Input.Keyboard.Key;
  private hudText?: Phaser.GameObjects.Text;
  private promptText?: Phaser.GameObjects.Text;
  private npcs: NpcRecord[] = [];
  private nearNpcId: string | null = null;

  constructor(locale: PatrolLocale, hooks: PatrolHooks) {
    super("patrol");
    this.locale = locale;
    this.hooks = hooks;
  }

  preload() {
    // Спрайты Kenney (CC0), нормализованные копии лежат в public/game/sprites.
    this.load.atlasXML("player", "/game/sprites/player.png", "/game/sprites/player.xml");
    this.load.atlasXML("shadow", "/game/sprites/shadow.png", "/game/sprites/shadow.xml");
    this.load.atlasXML("npc-female", "/game/sprites/npc-female.png", "/game/sprites/npc-female.xml");
    this.load.atlasXML("npc-male", "/game/sprites/npc-male.png", "/game/sprites/npc-male.xml");
  }

  create() {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Тёмный фон + сетка улиц.
    this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x060d1f).setOrigin(0);
    const grid = this.add.graphics().lineStyle(1, 0x0e1b33, 1);
    for (let x = 0; x <= WORLD_WIDTH; x += 80) grid.lineBetween(x, 0, x, WORLD_HEIGHT);
    for (let y = 0; y <= WORLD_HEIGHT; y += 80) grid.lineBetween(0, y, WORLD_WIDTH, y);

    // Дороги.
    this.add.rectangle(0, 540, WORLD_WIDTH, 120, 0x101c36).setOrigin(0, 0);
    this.add.rectangle(740, 0, 120, WORLD_HEIGHT, 0x101c36).setOrigin(0, 0);

    // Площадь в центре.
    this.add.circle(800, 600, 90, 0x0b2740).setStrokeStyle(3, 0x00d9ff, 0.6);

    // Районы: видимые здания + невидимые твёрдые тела + подписи.
    const solids: Phaser.GameObjects.Rectangle[] = [];
    for (const district of DISTRICTS) {
      this.add.rectangle(district.x, district.y, district.width, district.height, district.color, 0.28).setOrigin(0);
      this.add.rectangle(district.x, district.y, district.width, district.height).setOrigin(0).setStrokeStyle(3, district.color, 1);
      const solid = this.add.rectangle(
        district.x + district.width / 2,
        district.y + district.height / 2,
        district.width,
        district.height,
      );
      solid.setVisible(false);
      this.physics.add.existing(solid, true);
      solids.push(solid);
      this.add
        .text(district.x + district.width / 2, district.y + district.height / 2, district.name[this.locale], {
          fontSize: "40px",
          fontStyle: "900",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setAlpha(0.9);
    }

    // Анимация ходьбы игрока из атласа.
    this.anims.create({
      key: "player-run",
      frames: this.anims.generateFrameNames("player", { prefix: "run", start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1,
    });

    this.player = this.physics.add.sprite(800, 600, "player", "idle");
    this.player.setScale(0.55);
    this.player.body.setSize(60, 100);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, solids);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // NPC с именами над головой.
    const npcData = PATROL_NPCS;
    this.npcs = npcData.map((npc) => {
      const sprite = this.physics.add.sprite(npc.x, npc.y, npc.sprite, "idle");
      sprite.setScale(0.55);
      if (npc.tint !== undefined) sprite.setTint(npc.tint);
      sprite.setImmovable(true);
      this.add
        .text(npc.x, npc.y - 52, npc.name[this.locale], {
          fontSize: "16px",
          fontStyle: "bold",
          color: "#ffd166",
          backgroundColor: "#060d1fcc",
          padding: { x: 6, y: 2 },
        })
        .setOrigin(0.5);
      const checkText = this.add
        .text(npc.x + 26, npc.y - 52, "✓", { fontSize: "20px", fontStyle: "900", color: "#34d399" })
        .setOrigin(0.5)
        .setVisible(false);
      return { id: npc.id, sprite, checkText, resolved: false };
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys("W,A,S,D") as Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
    this.talkKey = this.input.keyboard?.addKey("E") as Phaser.Input.Keyboard.Key;

    this.promptText = this.add
      .text(0, 0, this.locale === "ro" ? "[E] Vorbește" : "[E] Поговорить", {
        fontSize: "18px",
        fontStyle: "900",
        color: "#00d9ff",
        backgroundColor: "#060d1fee",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setVisible(false);

    this.hudText = this.add
      .text(12, 12, "", { fontSize: "18px", fontStyle: "bold", color: "#00d9ff", backgroundColor: "#060d1fcc", padding: { x: 10, y: 6 } })
      .setScrollFactor(0)
      .setDepth(100);
  }

  /** Помечает NPC как разобранного: галочка + лёгкий оттенок. */
  markResolved(npcId: string) {
    const record = this.npcs.find((npc) => npc.id === npcId);
    if (!record) return;
    record.resolved = true;
    record.checkText.setVisible(true);
    record.sprite.setTint(0xb8f5d0);
  }

  /** Сбрасывает патруль для новой попытки. */
  resetPatrol() {
    for (const record of this.npcs) {
      record.resolved = false;
      record.checkText.setVisible(false);
      record.sprite.clearTint();
    }
    this.nearNpcId = null;
    this.promptText?.setVisible(false);
  }

  update() {
    if (!this.player || !this.cursors || !this.wasd) return;
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    let vx = (Number(right) - Number(left)) * PLAYER_SPEED;
    let vy = (Number(down) - Number(up)) * PLAYER_SPEED;
    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }
    this.player.setVelocity(vx, vy);

    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      this.player.anims.play("player-run", true);
      if (vx !== 0) this.player.setFlipX(vx < 0);
    } else {
      this.player.anims.stop();
      this.player.setFrame("idle");
    }

    // Ближайший неразобранный NPC в радиусе разговора.
    this.nearNpcId = null;
    let best = TALK_DISTANCE;
    for (const record of this.npcs) {
      if (record.resolved) continue;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, record.sprite.x, record.sprite.y);
      if (distance < best) {
        best = distance;
        this.nearNpcId = record.id;
      }
    }
    const near = this.npcs.find((npc) => npc.id === this.nearNpcId);
    if (near && this.promptText) {
      this.promptText.setPosition(near.sprite.x, near.sprite.y - 84).setVisible(true);
      if (this.talkKey && Phaser.Input.Keyboard.JustDown(this.talkKey)) {
        this.hooks.onTalk(near.id);
      }
    } else {
      this.promptText?.setVisible(false);
    }

    const zone = DISTRICTS.find(
      (district) =>
        this.player !== undefined &&
        this.player.x >= district.x &&
        this.player.x <= district.x + district.width &&
        this.player.y >= district.y &&
        this.player.y <= district.y + district.height,
    );
    const hint = this.locale === "ro" ? "WASD / săgeți — mișcare, E — dialog" : "WASD / стрелки — движение, E — разговор";
    this.hudText?.setText(zone ? `${zone.name[this.locale]} · ${hint}` : hint);
  }
}
