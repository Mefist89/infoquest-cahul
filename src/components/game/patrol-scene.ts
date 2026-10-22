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
  private settingsBtn?: Phaser.GameObjects.Rectangle;
  private settingsIcon?: Phaser.GameObjects.Text;
  private settingsPanel!: Phaser.GameObjects.Container;
  private isSettingsOpen = false;
  
  private roadNetwork!: RoadNetwork;
  private roadGraph!: RoadGraph;
  private cityConfig: CityMapConfig;
  private obstacles?: Phaser.Physics.Arcade.StaticGroup;

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

    // Add collision between player and NPCs
    this.npcs.forEach((record) => {
      this.physics.add.collider(this.player, record.sprite);
    });

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

    // Fullscreen button (top-right corner, left of settings)
    this.fullscreenBtn = this.add
      .rectangle(
        this.cameras.main.width - 100,
        20,
        44,
        44,
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
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setScrollFactor(0);

    // Settings button (top-right corner of game canvas)
    this.settingsBtn = this.add
      .rectangle(
        this.cameras.main.width - 50,
        20,
        44,
        44,
        0x00d9ff,
        0.4
      )
      .setStrokeStyle(3, 0xffffff, 1)
      .setDepth(1000)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.toggleSettings())
      .on("pointerover", () => this.settingsBtn!.setFillStyle(0x00d9ff, 0.6))
      .on("pointerout", () => this.settingsBtn!.setFillStyle(0x00d9ff, 0.35));

    this.settingsIcon = this.add
      .text(0, 0, "⚙", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setScrollFactor(0);

    // Position fullscreen and settings buttons in top-right corner
    const updateButtonPositions = () => {
      const cam = this.cameras.main;
      const rightX = cam.scrollX + cam.width - 25;
      // Settings button (rightmost)
      this.settingsBtn!.setPosition(rightX, cam.scrollY + 20);
      this.settingsIcon!.setPosition(rightX, cam.scrollY + 20);
      // Fullscreen button (left of settings)
      this.fullscreenBtn!.setPosition(rightX - 55, cam.scrollY + 20);
      this.fullscreenIcon!.setPosition(rightX - 55, cam.scrollY + 20);
    };
    this.cameras.main.on("scroll", updateButtonPositions);
    updateButtonPositions();

    // Settings panel (initially hidden)
    this.createSettingsPanel();

    // Listen for fullscreen changes to update icon
    this.scale.on("fullscreenchange", () => {
      if (this.fullscreenIcon && this.fullscreenBtn) {
        this.fullscreenBtn.setFillStyle(this.scale.isFullscreen ? 0x34d399 : 0x00d9ff, 0.15);
        this.fullscreenIcon.setText(this.scale.isFullscreen ? "⛶" : "⛶");
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

  private toggleSettings(): void {
    this.isSettingsOpen = !this.isSettingsOpen;
    this.settingsPanel?.setVisible(this.isSettingsOpen);
    this.settingsBtn!.setFillStyle(this.isSettingsOpen ? 0x00d9ff : 0x00d9ff, this.isSettingsOpen ? 0.6 : 0.4);
  }

  private createSettingsPanel(): void {
    const cam = this.cameras.main;
    const panelX = cam.scrollX + cam.width - 50 - 220;
    const panelY = cam.scrollY + 70;

    // Panel background
    this.settingsPanel = this.add.container(0, 0);
    this.settingsPanel.setDepth(2000);
    this.settingsPanel.setScrollFactor(0);
    this.settingsPanel.setVisible(false);

    // Panel background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a1528, 0.98);
    bg.fillRoundedRect(0, 0, 220, 180, 16);
    bg.lineStyle(3, 0x00d9ff, 0.8);
    bg.strokeRoundedRect(0, 0, 220, 180, 16);
    this.settingsPanel.add(bg);

    // Title
    this.add.text(110, 16, this.locale === "ro" ? "Setări" : "Настройки", {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#00d9ff",
      fontFamily: "'Orbitron', sans-serif",
    }).setOrigin(0.5, 0).setDepth(2001).setScrollFactor(0);

    // Sound toggle
    this.createSettingItem(110, 50, "🔊", this.locale === "ro" ? "Sunet" : "Звук", true);

    // Fullscreen toggle
    this.createSettingItem(110, 100, this.scale.isFullscreen ? "⛶" : "⛶", this.locale === "ro" ? "Fullscreen" : "На весь экран", this.scale.isFullscreen, () => this.toggleFullscreen());

    // Exit button
    this.createSettingItem(110, 150, "✕", this.locale === "ro" ? "Ieșire" : "Выход", false, () => this.exitGame());

    this.settingsPanel.setPosition(panelX, panelY);
    this.settingsPanel.setVisible(false);
    this.settingsPanel.setDepth(2000);
  }

  private createSettingItem(x: number, y: number, icon: string, label: string, isOn: boolean = false, onClick?: () => void): void {
    const itemContainer = this.add.container(x, y);

    // Item background
    const itemBg = this.add.graphics();
    itemBg.fillStyle(0x000000, 0.3);
    itemBg.fillRoundedRect(-90, -25, 180, 50, 10);
    itemBg.lineStyle(1, 0x00d9ff, 0.3);
    itemBg.strokeRoundedRect(-90, -25, 180, 50, 12);

    // Icon
    this.add.text(-80, 0, icon, {
      fontSize: "24px",
      color: "#00d9ff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(2001).setScrollFactor(0);

    // Label
    this.add.text(-20, 0, label, {
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold",
      fontFamily: "'Geist', sans-serif",
    }).setOrigin(0.5).setDepth(2001).setScrollFactor(0);

    // Toggle indicator or click handler
    if (onClick) {
      const indicator = this.add.circle(70, 0, 12, isOn ? 0x34d399 : 0x666666, 1)
        .setDepth(2001)
        .setScrollFactor(0)
        .setStrokeStyle(2, 0xffffff, 0.5);

      // Create hitArea at the container's world position so it's at (0,0) local to container
      const hitArea = this.add.rectangle(x, y, 180, 50)
        .setInteractive({ useHandCursor: true })
        .setDepth(2001)
        .setScrollFactor(0)
        .on("pointerdown", () => onClick && onClick())
        .on("pointerover", () => itemBg.fillStyle(0x00d9ff, 0.2).fillRoundedRect(-90, -25, 180, 50, 12))
        .on("pointerout", () => itemBg.fillStyle(0x000000, 0.3).fillRoundedRect(-90, -25, 180, 50, 12));

      // Add to container - hitArea is created at world position (x,y), so local position becomes (0,0) in container
      itemContainer.add([itemBg, indicator, hitArea]);
    } else {
      itemContainer.add(itemBg);
    }

    this.settingsPanel.add(itemContainer);
  }

  private exitGame(): void {
    // Close settings panel
    this.isSettingsOpen = false;
    this.settingsPanel?.setVisible(false);
    this.settingsBtn!.setFillStyle(0x00d9ff, 0.4);
    // Could navigate away or just close
  }

  private renderCityMap(): void {
    // Рендерим тайлы через RoadNetwork.render
    this.roadNetwork.render();
  }

  private createCollisions(): void {
    // Создаем статические физические тела для непроходимых тайлов (здания, трава)
    const tileMap = this.roadNetwork.getTileMap();
    const height = tileMap.length;
    const width = tileMap[0]?.length || 0;
    const tileSize = 16;
    const spacing = 1;
    const effectiveTileSize = tileSize + spacing; // 17

    // Группируем непроходимые тайлы по прямоугольникам для оптимизации
    const obstacles: Phaser.Physics.Arcade.StaticGroup = this.physics.add.staticGroup();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileId = tileMap[y][x];
        // Если это НЕ дорога, НЕ тротуар, НЕ перекресток - значит непроходимо
        const isWalkable = this.roadNetwork.isRoad(tileId) || 
                          this.roadNetwork.isSidewalk(tileId) || 
                          this.roadNetwork.isCrosswalk(tileId);
        
        if (!isWalkable && tileId > 0) {
          const px = x * effectiveTileSize + tileSize / 2;
          const py = y * effectiveTileSize + tileSize / 2;
          
          // Создаем невидимое статическое тело для коллизии
          const obstacle = obstacles.create(px, py, 'tiles');
          obstacle.setVisible(false);
          obstacle.setSize(effectiveTileSize, effectiveTileSize);
          obstacle.setImmovable(true);
        }
      }
    }

    // Добавляем коллизию между игроком и препятствиями
    if (this.player) {
      this.physics.add.collider(this.player, obstacles);
    }
    
    // Сохраняем для возможного использования
    this.obstacles = obstacles;
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