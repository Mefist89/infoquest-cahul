import Phaser from "phaser";
import { RoadNetwork, RoadGraph, RoadNode } from "./RoadNetwork";
import { CityMapGenerator, DEFAULT_CITY_CONFIG, CityMapConfig } from "./RoadMapGenerator";

import { PATROL_NPCS } from "@/data/patrol";

export type PatrolLocale = "ru" | "ro";

const PLAYER_SPEED = 260;
const TALK_DISTANCE = 100;

export class PatrolScene extends Phaser.Scene {
  private locale: PatrolLocale;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private talkKey?: Phaser.Input.Keyboard.Key;
  private hudText?: Phaser.GameObjects.Text;
  private promptText?: Phaser.GameObjects.Text;
  private npcs: NpcRecord[] = [];
  private nearNpcId: string | null = null;
  
  private fullscreenBtn?: Phaser.GameObjects.Rectangle;
  private fullscreenIcon?: Phaser.GameObjects.Text;
  
  private roadNetwork!: RoadNetwork;
  private roadGraph!: RoadGraph;
  private cityConfig: CityMapConfig;

  getNearNpcId(): string | null {
    return this.nearNpcId;
  }

  constructor(locale: PatrolLocale) {
    super("patrol");
    this.locale = locale;
    this.cityConfig = { ...DEFAULT_CITY_CONFIG };
  }

  preload() {
    // Спрайты Kenney (CC0), нормализованные копии лежат в public/game/sprites.
    this.load.atlasXML("player", "/game/sprites/player.png", "/game/sprites/player.xml");
    this.load.atlasXML("shadow", "/game/sprites/shadow.png", "/game/sprites/shadow.xml");
    this.load.atlasXML("npc-female", "/game/sprites/npc-female.png", "/game/sprites/npc-female.xml");
    this.load.atlasXML("npc-male", "/game/sprites/npc-male.png", "/game/sprites/npc-male.xml");
    
    // Загружаем тайлы для рендеринга карты (используем Kenney tiles)
    this.load.image("tiles", "/kenney_rpg-urban-pack/Tiles/tilemap_packed.png");
    // Загружаем тайлмап
    this.load.tilemapTiledJSON("citymap", "/kenney_rpg-urban-pack/Tilemap/tilemap.json");
  }

  create() {
    // Инициализируем дорожную сеть
    this.roadNetwork = new RoadNetwork(this);
    this.cityConfig = { ...DEFAULT_CITY_CONFIG };
    
    // Генерируем городскую карту
    const cityGenerator = new CityMapGenerator(this.roadNetwork, this.cityConfig);
    const tileMap = cityGenerator.generate();
    this.roadNetwork.createRoadMap(this.cityConfig.width, this.cityConfig.height, tileMap);
    
    // Строим граф дорог для навигации
    this.roadGraph = this.roadNetwork.buildRoadGraph();

    // Настройка камеры и мира
    const worldWidth = DEFAULT_CITY_CONFIG.width * (16 + 1);
    const worldHeight = DEFAULT_CITY_CONFIG.height * (16 + 1);
    
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Рендерим карту
    this.renderCityMap();

    // Создаем коллизии для зданий и непроходимых тайлов
    this.createCollisions();

    // Игрок
    this.anims.create({
      key: "player-run",
      frames: this.anims.generateFrameNames("player", { prefix: "run", start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1,
    });

    // Находим безопасную точку спавна (на дороге)
    const spawnPoint = this.findSafeSpawnPoint();
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player", "idle");
    this.player.setScale(0.55);
    this.player.body.setSize(60, 100);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // NPCs
    this.createNPCs();

    // Управление
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

    // Fullscreen button (top-right corner of game canvas) - more visible
    this.fullscreenBtn = this.add
      .rectangle(
        this.cameras.main.width - 40,
        20,
        40,
        40,
        0x00d9ff,
        0.4
      )
      .setStrokeStyle(3, 0xffffff, 1)
      .setDepth(1000)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.toggleFullscreen())
      .on("pointerover", () => this.fullscreenBtn!.setFillStyle(0x00d9ff, 0.6))
      .on("pointerout", () => this.fullscreenBtn!.setFillStyle(0x00d9ff, 0.35));

    this.fullscreenIcon = this.add
      .text(0, 0, "⛶", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setScrollFactor(0);

    // Position fullscreen button in top-right corner
    const updateFullscreenBtnPos = () => {
      const cam = this.cameras.main;
      this.fullscreenBtn!.setPosition(cam.scrollX + cam.width - 50, cam.scrollY + 15);
      if (this.fullscreenIcon) {
        this.fullscreenIcon!.setPosition(cam.scrollX + cam.width - 50, cam.scrollY + 25);
      }
    };
    this.cameras.main.on("scroll", updateFullscreenBtnPos);
    updateFullscreenBtnPos();

    // Listen for fullscreen changes to update icon
    this.scale.on("fullscreenchange", () => {
      if (this.fullscreenIcon) {
        this.fullscreenBtn!.setFillStyle(this.scale.isFullscreen ? 0x34d399 : 0x00d9ff, 0.5);
      }
    });

    // Fullscreen toggle
    this.fullscreenBtn!.on("pointerdown", () => this.toggleFullscreen());

    }

  private findSafeSpawnPoint(): { x: number; y: number } {
    // Находим ближайшую к центру дорожную плитку
    const centerX = (DEFAULT_CITY_CONFIG.width * 17) / 2;
    const centerY = (DEFAULT_CITY_CONFIG.height * 17) / 2;
    
    let closest: RoadNode | null = null;
    let minDist = Infinity;
    
    for (const node of this.roadGraph.nodes.values()) {
      const dist = Math.hypot(node.x - centerX, node.y - centerY);
      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }
    
    return closest ? { x: closest.x, y: closest.y } : { x: 400, y: 300 };
  }

  private toggleFullscreen(): void {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }

  private renderCityMap(): void {
    // Рендерим тайлы через RoadNetwork.render
    this.roadNetwork.render();
  }

  private createCollisions(): void {
    // Создаем коллизии для зданий (непроходимые тайлы)
    // В RoadNetwork isRoad/isSidewalk возвращают true для проходимых тайлов
    // Здания и трава - непроходимые
  }

  private createNPCs(): void {
    this.npcs = PATROL_NPCS.map((npc) => {
      // Находим безопасную позицию рядом с дорогой для NPC
      const spawnPoint = this.findNPCSpawnPoint(npc.x, npc.y);
      const sprite = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, npc.sprite, "idle");
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
        .text(spawnPoint.x + 26, spawnPoint.y - 52, "✓", { fontSize: "20px", fontStyle: "900", color: "#34d399" })
        .setOrigin(0.5)
        .setVisible(false);
      
      return { id: npc.id, sprite, checkText, resolved: false };
    });
  }

  private findNPCSpawnPoint(preferredX: number, preferredY: number): { x: number; y: number } {
    // Находим ближайшую дорожную плитку к предпочитаемой позиции
    let closest: RoadNode | null = null;
    let minDist = Infinity;
    
    for (const node of this.roadGraph.nodes.values()) {
      const dist = Math.hypot(node.x - preferredX, node.y - preferredY);
      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }
    
    return closest ? { x: closest.x, y: closest.y } : { x: 400, y: 300 };
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

    // Ограничиваем движение только по дорогам
    this.constrainToRoads();

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
        // Launch dialogue scene and listen for its completion on ITS event emitter
        this.scene.launch("dialogue", {
          npcId: near.id,
          locale: this.locale,
        });
        this.scene.pause();
        
        // Listen for dialogue completion on the DIALOGUE SCENE's event emitter
        const dialogueScene = this.scene.get("dialogue");
        if (dialogueScene) {
          dialogueScene.events.once("dialogue-complete", (correct: boolean) => {
            this.scene.resume();
            const record = this.npcs.find((npc) => npc.id === this.nearNpcId);
            if (record) {
              if (correct) {
                this.markResolved(this.nearNpcId!);
              } else {
                this.cameras.main.shake(200, 0.01);
              }
            }
            this.nearNpcId = null;
            this.promptText?.setVisible(false);
          });
        }
        this.scene.pause();
      }
    } else {
      this.promptText?.setVisible(false);
    }

    // Обновляем HUD
    const zone = this.getCurrentZone();
    const hint = this.locale === "ro" ? "WASD / săgeți — mișcare, E — dialog" : "WASD / стрелки — движение, E — разговор";
    this.hudText?.setText(zone ? `${zone.name[this.locale]} · ${hint}` : hint);
  }

  private constrainToRoads(): void {
    // Ограничиваем движение игрока только по дорогам
    // Проверяем, находится ли игрок на дороге
    if (!this.roadGraph) return;
    
    const tileX = Math.floor(this.player.x / 17);
    const tileY = Math.floor(this.player.y / 17);
    const tileMap = this.roadNetwork.getTileMap();
    const tileId = this.getTileIdSafe(tileMap, tileX, tileY);
    if (!this.roadNetwork.isRoad(tileId)) {
      // Игрок сбился с дороги - возвращаем на ближайшую дорогу
      if (!this.roadGraph) return;
      let closest: RoadNode | null = null;
      let minDist = Infinity;
      
      for (const node of this.roadGraph.nodes.values()) {
        const dist = Math.hypot(node.x - this.player.x, node.y - this.player.y);
        if (dist < minDist) {
          minDist = dist;
          closest = node;
        }
      }
      
      if (closest) {
        this.player.x = closest.x;
        this.player.y = closest.y;
        this.player.setVelocity(0, 0);
      }
    }
  }

  private getTileIdSafe(tileMap: number[][], tileX: number, tileY: number): number {
    const row = tileMap[tileY];
    if (!row) return -1;
    return (row[tileX] ?? -1) as number;
  }

  private getCurrentZone(): District | undefined {
    return DISTRICTS.find(
      (district) =>
        this.player !== undefined &&
        this.player.x >= district.x &&
        this.player.x <= district.x + district.width &&
        this.player.y >= district.y &&
        this.player.y <= district.y + district.height,
    );
  }
}

// Типы для NPC
type NpcRecord = {
  id: string;
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  checkText: Phaser.GameObjects.Text;
  resolved: boolean;
};

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