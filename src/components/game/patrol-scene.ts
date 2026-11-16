import Phaser from "phaser";
import { RoadNetwork, RoadGraph, RoadNode } from "./RoadNetwork";
import { CityMapGenerator, DEFAULT_CITY_CONFIG, CityMapConfig } from "./RoadMapGenerator";

import { PATROL_DISTRICTS, PATROL_NPCS, PATROL_SCENE_META, type PatrolDistrict } from "@/data/patrol";
import { BASE_HEIGHT, BASE_WIDTH, getRenderScale, viewSize } from "./render-scale";
import { gameText } from "./text-style";

export type PatrolLocale = "ru" | "ro";

const PLAYER_SPEED = 260;
const TALK_DISTANCE = 105;

export class PatrolScene extends Phaser.Scene {
  private locale: PatrolLocale;
  private onDialogueComplete?: (correct: boolean, npcId: string) => void;
  private onOpenDeliverySmsTrainer?: (npcId: string) => void;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private talkKey?: Phaser.Input.Keyboard.Key;
  private hudText?: Phaser.GameObjects.Text;
  private promptText?: Phaser.GameObjects.Text;
  private npcs: NpcRecord[] = [];
  private nearNpcId: string | null = null;

  private fullscreenBtn?: Phaser.GameObjects.Rectangle;
  private uiCamera?: Phaser.Cameras.Scene2D.Camera;
  private fullscreenIcon?: Phaser.GameObjects.Graphics;
  private settingsBtn?: Phaser.GameObjects.Rectangle;
  private settingsIcon?: Phaser.GameObjects.Text;
  private settingsPanel!: Phaser.GameObjects.Container;
  private isSettingsOpen = false;

  private roadNetwork!: RoadNetwork;
  private roadGraph!: RoadGraph;
  private cityConfig: CityMapConfig;
  private obstacles?: Phaser.Physics.Arcade.StaticGroup;
  private onDomFullscreenChange?: () => void;
  private moveTarget: { x: number; y: number } | null = null;
  private lastProgressPos: { x: number; y: number } = { x: 0, y: 0 };
  private stuckTimer = 0;
  private orientationPaused = false;

  getNearNpcId(): string | null {
    return this.nearNpcId;
  }

  setOrientationPaused(paused: boolean): void {
    this.orientationPaused = paused;
    if (paused) {
      this.moveTarget = null;
      this.player?.setVelocity(0, 0);
      this.player?.anims.stop();
      this.player?.setFrame("idle");
    }
  }

  private isTouchDevice(): boolean {
    const coarse =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    return Boolean(coarse || this.sys?.game?.device?.input?.touch);
  }

  constructor(
    locale: PatrolLocale,
    onDialogueComplete?: (correct: boolean, npcId: string) => void,
    onOpenDeliverySmsTrainer?: (npcId: string) => void,
  ) {
    super("patrol");
    this.locale = locale;
    this.onDialogueComplete = onDialogueComplete;
    this.onOpenDeliverySmsTrainer = onOpenDeliverySmsTrainer;
    this.cityConfig = { ...DEFAULT_CITY_CONFIG };
  }

  preload() {
    // Персонажи (публичные атласы в public/game/sprites)
    this.load.atlasXML("player", "/game/sprites/player.png", "/game/sprites/player.xml");
    this.load.atlasXML("shadow", "/game/sprites/shadow.png", "/game/sprites/shadow.xml");
    this.load.atlasXML("npc-female", "/game/sprites/npc-female.png", "/game/sprites/npc-female.xml");
    this.load.atlasXML("npc-male", "/game/sprites/npc-male.png", "/game/sprites/npc-male.xml");

    // Городской тайлсет и анимации из CP_V1.1.0_nyknck
    this.load.image("cp-city", "/CP_V1.1.0_nyknck/CP_V1.0.4_nyknck/CP_V1.0.4.png");
    this.load.image("cp-doors", "/CP_V1.1.0_nyknck/Animations/BD001.png");
    this.load.image("cp-lights", "/CP_V1.1.0_nyknck/Animations/BL001.png");
    this.load.image("cp-streetlights", "/CP_V1.1.0_nyknck/Animations/SL001.png");
  }

  create() {
    for (const key of ["cp-city", "cp-doors", "cp-lights", "cp-streetlights"]) {
      this.textures.get(key)?.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // Холст больше логического поля в getRenderScale() раз: мир увеличивает основная камера,
    // а панель (HUD) рисует отдельная камера без прокрутки — так текст остаётся чётким.
    const renderScale = getRenderScale();
    this.cameras.main.setZoom(renderScale);
    const uiCamera = this.cameras
      .add(0, 0, this.scale.width, this.scale.height)
      .setOrigin(0, 0)
      .setZoom(renderScale)
      .setScroll(0, 0);
    this.uiCamera = uiCamera;
    const hideFromUi = (gameObject: Phaser.GameObjects.GameObject) => uiCamera.ignore(gameObject);
    this.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, hideFromUi);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, hideFromUi);
    });

    this.roadNetwork = new RoadNetwork(this);
    this.cityConfig = { ...DEFAULT_CITY_CONFIG };

    const cityGenerator = new CityMapGenerator(this.roadNetwork, this.cityConfig);
    const tileMap = cityGenerator.generate();
    this.roadNetwork.createRoadMap(this.cityConfig.width, this.cityConfig.height, tileMap);
    this.roadGraph = this.roadNetwork.buildRoadGraph();

    const effectiveTile = this.cityConfig.tileSize * this.cityConfig.scale; // 32px
    const worldWidth = this.cityConfig.width * effectiveTile; // 1600
    const worldHeight = this.cityConfig.height * effectiveTile; // 1216

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Рендерим город из ассетов CP_V1.1.0_nyknck
    this.roadNetwork.render(this.locale);

    // Анимация бега игрока
    if (!this.anims.exists("player-run")) {
      this.anims.create({
        key: "player-run",
        frames: this.anims.generateFrameNames("player", { prefix: "run", start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    const spawnPoint = this.findSafeSpawnPoint();
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player", "idle");
    this.player.setScale(0.5);
    this.player.body.setSize(52, 44);
    this.player.body.setOffset(22, 76);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(this.player.y);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    // Создаём коллизии со зданиями после инициализации игрока
    this.createCollisions();

    // Создаём жителей (NPC) рядом с ключевыми зданиями районов
    this.createNPCs();

    this.npcs.forEach((record) => {
      this.physics.add.collider(this.player, record.sprite);
    });

    // Управление
    this.input.keyboard?.disableGlobalCapture();
    this.cursors = this.input.keyboard?.addKeys(
      {
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      },
      false,
    ) as Phaser.Types.Input.Keyboard.CursorKeys;
    this.wasd = this.input.keyboard?.addKeys("W,A,S,D", false) as Record<
      "W" | "A" | "S" | "D",
      Phaser.Input.Keyboard.Key
    >;
    this.talkKey = this.input.keyboard?.addKey("E", false) as Phaser.Input.Keyboard.Key;

    const meta = PATROL_SCENE_META[this.locale];
    const promptLabel = this.isTouchDevice() ? meta.touchTalkPrompt : meta.keyTalkPrompt;

    this.promptText = this.add
      .text(
        0,
        0,
        promptLabel,
        gameText("16px", {
          fontStyle: "900",
          color: "#00d9ff",
          backgroundColor: "#060d1fee",
          padding: { x: 8, y: 4 },
        }),
      )
      .setOrigin(0.5)
      .setDepth(3000)
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.nearNpcId) {
          this.startConversation(this.nearNpcId);
        }
      });

    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        if (this.orientationPaused || this.isSettingsOpen) return;
        if (currentlyOver.length > 0) return;
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.moveTarget = { x: worldPoint.x, y: worldPoint.y };
        this.lastProgressPos = { x: this.player.x, y: this.player.y };
        this.stuckTimer = 0;
      },
    );

    this.hudText = this.add
      .text(
        12,
        12,
        "",
        gameText("16px", {
          fontStyle: "bold",
          color: "#00d9ff",
          backgroundColor: "#060d1fcc",
          padding: { x: 10, y: 6 },
        }),
      )
      .setScrollFactor(0)
      .setDepth(3000);

    // Кнопка полного экрана
    this.fullscreenBtn = this.add
      .rectangle(viewSize(this).width - 85, 30, 42, 42, 0x060d1f, 0.85)
      .setStrokeStyle(2, 0x00d9ff, 0.9)
      .setDepth(3000)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.toggleFullscreen())
      .on("pointerover", () => this.fullscreenBtn!.setFillStyle(0x00d9ff, 0.35))
      .on("pointerout", () => this.fullscreenBtn!.setFillStyle(0x060d1f, 0.85));

    this.fullscreenIcon = this.add
      .graphics()
      .setPosition(viewSize(this).width - 85, 30)
      .setDepth(3001)
      .setScrollFactor(0);
    this.drawFullscreenCorners(this.fullscreenIcon);

    // Кнопка настроек
    this.settingsBtn = this.add
      .rectangle(viewSize(this).width - 34, 30, 42, 42, 0x060d1f, 0.85)
      .setStrokeStyle(2, 0x00d9ff, 0.9)
      .setDepth(3000)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.toggleSettings())
      .on("pointerover", () => this.settingsBtn!.setFillStyle(0x00d9ff, 0.35))
      .on("pointerout", () => this.settingsBtn!.setFillStyle(0x060d1f, 0.85));

    this.settingsIcon = this.add
      .text(
        viewSize(this).width - 34,
        30,
        "⚙",
        gameText("20px", {
          color: "#00d9ff",
          fontStyle: "bold",
        }),
      )
      .setOrigin(0.5)
      .setDepth(3001)
      .setScrollFactor(0);

    this.createSettingsPanel();

    [this.hudText, this.fullscreenBtn, this.fullscreenIcon, this.settingsBtn, this.settingsIcon, this.settingsPanel].forEach(
      (gameObject) => gameObject && this.showOnlyInHud(gameObject),
    );

    // Адаптация размеров холста и HUD при входе/выходе из полноэкранного режима
    this.scale.on("resize", this.handleResize, this);
    this.onDomFullscreenChange = () => {
      this.syncFullscreenSize();
      window.setTimeout(() => {
        if (this.sys?.isActive()) {
          this.syncFullscreenSize();
        }
      }, 60);
    };
    document.addEventListener("fullscreenchange", this.onDomFullscreenChange);
    const cleanupListeners = () => {
      this.scale.off("resize", this.handleResize, this);
      if (this.onDomFullscreenChange) {
        document.removeEventListener("fullscreenchange", this.onDomFullscreenChange);
      }
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanupListeners);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanupListeners);
  }

  /** Объект панели виден только HUD-камере (и вместе со всеми вложенными в контейнер). */
  private showOnlyInHud(gameObject: Phaser.GameObjects.GameObject): void {
    const uiCamera = this.uiCamera;
    if (!uiCamera) return;
    gameObject.cameraFilter = (gameObject.cameraFilter & ~uiCamera.id) | this.cameras.main.id;
    if (gameObject instanceof Phaser.GameObjects.Container) {
      gameObject.list.forEach((child) => this.showOnlyInHud(child));
    }
  }

  private drawFullscreenCorners(g: Phaser.GameObjects.Graphics): void {
    const r = 8;
    const arm = 5;
    g.clear();
    g.lineStyle(2, 0x00d9ff, 1);
    // Top-left corner
    g.beginPath();
    g.moveTo(-r, -r + arm);
    g.lineTo(-r, -r);
    g.lineTo(-r + arm, -r);
    // Top-right corner
    g.moveTo(r - arm, -r);
    g.lineTo(r, -r);
    g.lineTo(r, -r + arm);
    // Bottom-left corner
    g.moveTo(-r, r - arm);
    g.lineTo(-r, r);
    g.lineTo(-r + arm, r);
    // Bottom-right corner
    g.moveTo(r - arm, r);
    g.lineTo(r, r);
    g.lineTo(r, r - arm);
    g.strokePath();
  }

  private syncFullscreenSize(): void {
    const isFs = Boolean(document.fullscreenElement) || this.scale.isFullscreen;
    this.scale.getParentBounds();
    if (isFs) {
      const screenW = window.innerWidth || window.screen.width || 1920;
      const screenH = window.innerHeight || window.screen.height || 1080;
      const targetHeight = 600;
      const targetWidth = Math.min(1560, Math.max(960, Math.round(targetHeight * (screenW / screenH))));
      this.scale.setParentSize(screenW, screenH);
      this.scale.setGameSize(targetWidth * getRenderScale(), targetHeight * getRenderScale());
    } else {
      this.scale.setGameSize(BASE_WIDTH * getRenderScale(), BASE_HEIGHT * getRenderScale());
      this.scale.refresh();
    }
    this.handleResize(this.scale.gameSize);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const renderScale = getRenderScale();
    this.cameras?.main?.setSize(gameSize.width, gameSize.height);
    this.uiCamera?.setSize(gameSize.width, gameSize.height);
    // Позиции HUD — в логических координатах (холст увеличен в renderScale раз).
    const width = gameSize.width / renderScale;
    this.fullscreenBtn?.setPosition(width - 85, 30);
    this.fullscreenIcon?.setPosition(width - 85, 30);
    this.settingsBtn?.setPosition(width - 34, 30);
    this.settingsIcon?.setPosition(width - 34, 30);
    this.settingsPanel?.setPosition(width - 236, 60);
  }

  private findSafeSpawnPoint(): { x: number; y: number } {
    const effectiveTile = this.cityConfig.tileSize * this.cityConfig.scale;
    const centerX = (this.cityConfig.width * effectiveTile) / 2;
    const centerY = (this.cityConfig.height * effectiveTile) / 2;

    let closest: RoadNode | null = null;
    let minDist = Infinity;
    for (const node of this.roadGraph.nodes.values()) {
      const dist = Math.hypot(node.x - centerX, node.y - centerY);
      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }
    return closest ? { x: closest.x, y: closest.y } : { x: 800, y: 608 };
  }

  private toggleFullscreen(): void {
    const container =
      (this.scale.fullscreenTarget as HTMLElement | null) ??
      (this.game.canvas?.parentElement as HTMLElement | null) ??
      this.game.canvas;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {
        if (this.scale.isFullscreen) this.scale.stopFullscreen();
      });
    } else if (container?.requestFullscreen) {
      void container.requestFullscreen().catch(() => {
        this.scale.startFullscreen();
      });
    } else if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }

  private toggleSettings(): void {
    this.isSettingsOpen = !this.isSettingsOpen;
    this.settingsPanel?.setVisible(this.isSettingsOpen);
  }

  private createSettingsPanel(): void {
    const panelX = viewSize(this).width - 236;
    const panelY = 60;

    this.settingsPanel = this.add.container(panelX, panelY);
    this.settingsPanel.setDepth(3100);
    this.settingsPanel.setScrollFactor(0);
    this.settingsPanel.setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a1528, 0.96);
    bg.fillRoundedRect(0, 0, 220, 135, 16);
    bg.lineStyle(2, 0x00d9ff, 0.85);
    bg.strokeRoundedRect(0, 0, 220, 135, 16);
    this.settingsPanel.add(bg);

    const meta = PATROL_SCENE_META[this.locale];
    const title = this.add
      .text(
        110,
        14,
        meta.settingsTitle,
        gameText("16px", {
          fontStyle: "bold",
          color: "#00d9ff",
        }),
      )
      .setOrigin(0.5, 0);
    this.settingsPanel.add(title);

    this.createSettingItem(110, 64, "⛶", meta.fullscreenLabel, this.scale.isFullscreen, () =>
      this.toggleFullscreen(),
    );
    this.createSettingItem(110, 108, "✕", meta.closeLabel, false, () => this.toggleSettings());
  }

  private createSettingItem(x: number, y: number, icon: string, label: string, isOn = false, onClick?: () => void): void {
    const row = this.add.container(x, y);
    const bg = this.add
      .rectangle(0, 0, 190, 38, 0x112240, 0.85)
      .setStrokeStyle(1, 0x00d9ff, 0.35)
      .setInteractive({ useHandCursor: true });

    const iconText = this.add.text(-76, 0, icon, gameText("16px", { color: "#00d9ff" })).setOrigin(0.5);
    const labelText = this.add
      .text(-8, 0, label, gameText("13px", { fontStyle: "bold", color: "#ffffff" }))
      .setOrigin(0.5);
    const dot = this.add.circle(74, 0, 7, isOn ? 0x34d399 : 0x475569);

    bg.on("pointerover", () => bg.setFillStyle(0x00d9ff, 0.25));
    bg.on("pointerout", () => bg.setFillStyle(0x112240, 0.85));
    bg.on("pointerdown", () => {
      if (onClick) onClick();
    });

    row.add([bg, iconText, labelText, dot]);
    this.settingsPanel.add(row);
  }

  private createCollisions(): void {
    const obstacles = this.physics.add.staticGroup();
    for (const box of this.roadNetwork.getBuildingColliders()) {
      const zone = this.add.zone(box.x, box.y, box.width, box.height);
      this.physics.add.existing(zone, true);
      obstacles.add(zone);
    }
    this.physics.add.collider(this.player, obstacles);
    this.obstacles = obstacles;
  }

  private createNPCs(): void {
    // Позиции на тротуарах перед главными зданиями каждого района
    const npcLocations: Record<string, { x: number; y: number }> = {
      "school-friend": { x: 350, y: 455 },
      "bank-operator": { x: 1250, y: 455 },
      "post-maria": { x: 350, y: 865 },
      "shop-seller": { x: 1250, y: 865 },
    };

    this.npcs = PATROL_NPCS.map((npc) => {
      const pos = npcLocations[npc.id] ?? { x: npc.x, y: npc.y };
      const sprite = this.physics.add.sprite(pos.x, pos.y, npc.sprite, "idle");
      sprite.setScale(0.5);
      if (npc.tint !== undefined) sprite.setTint(npc.tint);
      sprite.setImmovable(true);
      sprite.setDepth(pos.y);

      const nameText = this.add
        .text(
          pos.x,
          pos.y - 54,
          npc.name[this.locale],
          gameText("14px", {
            fontStyle: "bold",
            color: "#ffd166",
            backgroundColor: "#060d1fe6",
            padding: { x: 7, y: 3 },
          }),
        )
        .setOrigin(0.5)
        .setDepth(pos.y + 10);

      const handleNpcTap = () => {
        const record = this.npcs.find((n) => n.id === npc.id);
        if (!record || record.resolved || this.orientationPaused || this.isSettingsOpen) return;
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, record.sprite.x, record.sprite.y);
        if (this.nearNpcId === npc.id || distance < TALK_DISTANCE) {
          this.startConversation(npc.id);
        } else {
          this.moveTarget = { x: record.sprite.x, y: record.sprite.y };
          this.lastProgressPos = { x: this.player.x, y: this.player.y };
          this.stuckTimer = 0;
        }
      };

      sprite.setInteractive({ useHandCursor: true }).on("pointerdown", handleNpcTap);
      nameText.setInteractive({ useHandCursor: true }).on("pointerdown", handleNpcTap);

      return { id: npc.id, sprite, nameText, resolved: false };
    });
  }

  private startConversation(activeNpcId: string): void {
    const record = this.npcs.find((npc) => npc.id === activeNpcId);
    if (!record || record.resolved || !this.player) return;

    this.moveTarget = null;
    this.promptText?.setVisible(false);
    this.player.setVelocity(0, 0);
    this.player.anims.stop();
    this.player.setFrame("idle");

    if (activeNpcId === "post-maria" && this.onOpenDeliverySmsTrainer) {
      this.scene.pause();
      this.onOpenDeliverySmsTrainer(activeNpcId);
      return;
    }

    let completed = false;
    const finishDialogue = (correct: boolean) => {
      if (completed) return;
      completed = true;
      this.scene.resume();
      this.nearNpcId = activeNpcId;
      if (correct) {
        this.markResolved(activeNpcId);
      } else {
        this.cameras.main.shake(200, 0.01);
      }
      this.onDialogueComplete?.(correct, activeNpcId);
      this.events?.emit("dialogue-complete", correct, activeNpcId);
      this.nearNpcId = null;
      this.promptText?.setVisible(false);
    };

    if (activeNpcId === "school-friend") {
      this.scene.launch("fake-call", {
        locale: this.locale,
        onComplete: finishDialogue,
        onClose: () => {
          this.scene.resume();
          this.nearNpcId = null;
          this.promptText?.setVisible(false);
        },
      });
      this.scene.bringToTop("fake-call");
      this.scene.pause();
      return;
    }

    if (activeNpcId === "shop-seller") {
      this.scene.launch("hacked-account", {
        locale: this.locale,
        onComplete: finishDialogue,
        onClose: () => {
          this.scene.resume();
          this.nearNpcId = null;
          this.promptText?.setVisible(false);
        },
      });
      this.scene.bringToTop("hacked-account");
      this.scene.pause();
      return;
    }

    this.scene.launch("dialogue", {
      npcId: activeNpcId,
      locale: this.locale,
      onComplete: finishDialogue,
    });
    this.scene.bringToTop("dialogue");
    this.scene.pause();
  }

  /** Помечает NPC как разобранного: галочка в подписи + лёгкий оттенок. */
  markResolved(npcId: string) {
    const record = this.npcs.find((npc) => npc.id === npcId);
    if (!record) return;
    const original = PATROL_NPCS.find((n) => n.id === npcId);
    record.resolved = true;
    if (original) {
      record.nameText.setText(`✓ ${original.name[this.locale]}`);
    }
    record.nameText.setColor("#34d399");
    record.sprite.setTint(0xb8f5d0);
  }

  /** Сбрасывает патруль для новой попытки. */
  resetPatrol() {
    for (const record of this.npcs) {
      record.resolved = false;
      const original = PATROL_NPCS.find((n) => n.id === record.id);
      if (original) {
        record.nameText.setText(original.name[this.locale]);
      }
      record.nameText.setColor("#ffd166");
      if (original?.tint !== undefined) {
        record.sprite.setTint(original.tint);
      } else {
        record.sprite.clearTint();
      }
    }
    this.moveTarget = null;
    this.nearNpcId = null;
    this.promptText?.setVisible(false);
  }

  update(_time: number, delta: number) {
    if (!this.player || !this.cursors || !this.wasd) return;
    if (this.orientationPaused) {
      this.player.setVelocity(0, 0);
      return;
    }

    this.roadNetwork.update(delta, this.player.x, this.player.y);

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    let vx = (Number(right) - Number(left)) * PLAYER_SPEED;
    let vy = (Number(down) - Number(up)) * PLAYER_SPEED;
    if (vx !== 0 || vy !== 0) {
      this.moveTarget = null;
      if (vx !== 0 && vy !== 0) {
        vx *= Math.SQRT1_2;
        vy *= Math.SQRT1_2;
      }
    } else if (this.moveTarget) {
      const dx = this.moveTarget.x - this.player.x;
      const dy = this.moveTarget.y - this.player.y;
      const distance = Math.hypot(dx, dy);
      const moved = Math.hypot(this.player.x - this.lastProgressPos.x, this.player.y - this.lastProgressPos.y);
      if (moved > 2) {
        this.lastProgressPos = { x: this.player.x, y: this.player.y };
        this.stuckTimer = 0;
      } else {
        this.stuckTimer += delta;
      }
      if (distance <= 14 || this.stuckTimer > 180) {
        this.moveTarget = null;
        vx = 0;
        vy = 0;
      } else {
        vx = (dx / distance) * PLAYER_SPEED;
        vy = (dy / distance) * PLAYER_SPEED;
      }
    }
    this.player.setVelocity(vx, vy);
    this.player.setDepth(this.player.y);

    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      this.player.anims.play("player-run", true);
      if (vx !== 0) this.player.setFlipX(vx < 0);
    } else {
      this.player.anims.stop();
      this.player.setFrame("idle");
    }

    // Ближайший неразобранный NPC в радиусе разговора
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
      this.promptText
        .setPosition(near.sprite.x, near.nameText.y - near.nameText.height - 6)
        .setVisible(true);
      if (this.talkKey && Phaser.Input.Keyboard.JustDown(this.talkKey)) {
        this.startConversation(near.id);
        return;
      }
    } else {
      this.promptText?.setVisible(false);
    }

    const zone = this.getCurrentZone();
    this.hudText?.setText(zone ? zone.name[this.locale] : "");
  }

  private getCurrentZone(): PatrolDistrict | undefined {
    if (!this.player) return PATROL_DISTRICTS[0];
    const inside = PATROL_DISTRICTS.find(
      (district) =>
        this.player.x >= district.x &&
        this.player.x <= district.x + district.width &&
        this.player.y >= district.y &&
        this.player.y <= district.y + district.height,
    );
    if (inside) return inside;
    return PATROL_DISTRICTS.reduce((best, district) => {
      const cx = district.x + district.width / 2;
      const cy = district.y + district.height / 2;
      const bestCx = best.x + best.width / 2;
      const bestCy = best.y + best.height / 2;
      return Math.hypot(this.player.x - cx, this.player.y - cy) <
        Math.hypot(this.player.x - bestCx, this.player.y - bestCy)
        ? district
        : best;
    }, PATROL_DISTRICTS[0]);
  }
}

type NpcRecord = {
  id: string;
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  nameText: Phaser.GameObjects.Text;
  resolved: boolean;
};
