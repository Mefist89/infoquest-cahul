import Phaser from "phaser";

import { PATROL_NPCS, type PatrolLocale } from "@/data/patrol";
import {
  HACKED_ACCOUNT_META,
  HACKED_LOGIN_TRAPS,
  HACKED_PROFILE_SPOTS,
  HACKED_SESSIONS,
  HACKED_SHIELD_LAYERS,
} from "@/data/patrol-hacked-account";
import { shuffle } from "./shuffle";
import { applyOverlayCamera, viewSize } from "./render-scale";
import { gameText } from "./text-style";

export interface HackedAccountSceneData {
  locale: PatrolLocale;
  onComplete?: (correct: boolean) => void;
  onClose?: () => void;
}

type StageId = 0 | 1 | 2 | 3 | 4 | 5;

export class HackedAccountScene extends Phaser.Scene {
  private locale: PatrolLocale = "ru";
  private onComplete?: (correct: boolean) => void;
  private onClose?: () => void;

  private stage: StageId = 0;
  private stageRoot?: Phaser.GameObjects.Container;
  private headerRoot?: Phaser.GameObjects.Container;
  private headerBottom = 112;

  // Stage 1: Profile X-Ray state
  private scannedFlagIds: Set<string> = new Set();
  private xrayReticle?: Phaser.GameObjects.Container;

  // Stage 2: Login Trap & QR Hijack state
  private trapIndex = 0;
  private trapSolved = false;
  private tunnelGraphics?: Phaser.GameObjects.Graphics;
  private tunnelPhase = 0;
  private tunnelY = 300;
  private stage2ShuffledBlockers: { id: string; label: string; isCorrect: boolean }[] = [];
  private stage2ShuffledTrapIndex = -1;

  // Stage 3: Active Sessions Manager state
  private killedSessionIds: Set<string> = new Set();
  private sessionPulseGraphics?: Phaser.GameObjects.Graphics;
  private sessionPulsePhase = 0;
  private sessionWaveY = 500;
  private sessionWaveGapLeft = 240;
  private sessionWaveGapRight = 720;

  // Stage 4: 3 Defense Layers vs Shadow state
  private layerRoundIndex = 0;
  private stage4ShuffledCards: (typeof HACKED_SHIELD_LAYERS)[0]["cards"] = [];
  private stage4ShuffledLayerIndex = -1;
  private shadowHp = 100;
  private mistakesCount = 0;
  private isTransitioning = false;

  constructor() {
    super("hacked-account");
  }

  init(data: HackedAccountSceneData) {
    this.locale = data.locale ?? "ru";
    this.onComplete = data.onComplete;
    this.onClose = data.onClose;

    this.stage = 0;
    this.scannedFlagIds = new Set();
    this.trapIndex = 0;
    this.trapSolved = false;
    this.stage2ShuffledBlockers = [];
    this.stage2ShuffledTrapIndex = -1;
    this.killedSessionIds = new Set();
    this.layerRoundIndex = 0;
    this.stage4ShuffledCards = [];
    this.stage4ShuffledLayerIndex = -1;
    this.shadowHp = 100;
    this.mistakesCount = 0;
    this.isTransitioning = false;
  }

  create() {
    applyOverlayCamera(this);
    const { width, height } = viewSize(this);

    // Полноэкранный тёмный фон кибер-лаборатории
    this.add.rectangle(0, 0, width, height, 0x040916, 0.96).setOrigin(0);

    // Декоративная сетка
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x00d9ff, 0.06);
    for (let x = 0; x <= width; x += 32) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += 32) {
      grid.lineBetween(0, y, width, y);
    }

    // Внешняя рамка консоли
    const frame = this.add.graphics();
    frame.fillStyle(0x0a1528, 0.98);
    frame.fillRoundedRect(12, 10, width - 24, height - 20, 20);
    frame.lineStyle(2.5, 0x00d9ff, 0.8);
    frame.strokeRoundedRect(12, 10, width - 24, height - 20, 20);

    // Выход по клавише Escape
    this.input.keyboard?.on("keydown-ESC", () => {
      this.closeScene();
    });

    this.renderHeader();
    this.renderCurrentStage();
  }

  update(_time: number, delta: number) {
    // Анимация перехвата пакетов данных на Этапе 2
    if (this.stage === 2 && this.tunnelGraphics && this.tunnelGraphics.scene) {
      this.tunnelPhase = (this.tunnelPhase + delta * 0.0012) % 1;
      this.drawDataTunnel();
    }

    // Анимация сетевой активности сессий на Этапе 3
    if (this.stage === 3 && this.sessionPulseGraphics && this.sessionPulseGraphics.scene) {
      this.sessionPulsePhase += delta * 0.006;
      this.drawSessionActivityWave();
    }
  }

  private getCompletedTasksCount(): { completed: number; total: number } {
    const totalFlags = HACKED_PROFILE_SPOTS.filter((s) => s.isFlag).length;
    const totalTraps = HACKED_LOGIN_TRAPS.length;
    const totalHackerSessions = HACKED_SESSIONS.filter((s) => s.isHacker).length;
    const totalLayers = HACKED_SHIELD_LAYERS.length;
    const total = totalFlags + totalTraps + totalHackerSessions + totalLayers;
    if (this.stage === 5) return { completed: total, total };

    const s1 = this.scannedFlagIds.size;
    const s2 =
      this.stage > 2
        ? totalTraps
        : this.stage === 2
          ? this.trapIndex + (this.trapSolved ? 1 : 0)
          : 0;
    const s3 =
      this.stage > 3
        ? totalHackerSessions
        : this.stage === 3
          ? this.killedSessionIds.size
          : 0;
    const s4 = this.stage === 4 ? this.layerRoundIndex : 0;

    return {
      completed: Math.min(total, s1 + s2 + s3 + s4),
      total,
    };
  }

  private renderHeader() {
    this.headerRoot?.destroy(true);
    this.headerRoot = this.add.container(0, 0);

    const { width } = viewSize(this);
    const meta = HACKED_ACCOUNT_META[this.locale];
    const { completed, total } = this.getCompletedTasksCount();
    const pct = Math.round((completed / total) * 100);
    const remaining = Math.max(0, total - completed);

    const headerX = 24;
    const headerY = 18;
    const headerW = width - 48;

    const headerBg = this.add.graphics();
    this.headerRoot.add(headerBg);

    // Кнопка закрытия (считаем ширину и высоту по тексту)
    const closeBtnTxt = this.add
      .text(
        0,
        0,
        meta.closeLabel,
        gameText("12px", {
          fontStyle: "bold",
          color: "#cbd5e1",
        }),
      )
      .setOrigin(0.5);
    const closeBtnW = Math.max(108, closeBtnTxt.width + 28);
    const closeBtnH = Math.max(28, closeBtnTxt.height + 10);
    const closeBtnX = headerX + headerW - 14 - closeBtnW / 2;
    const closeBtnY = headerY + 12 + closeBtnH / 2;
    closeBtnTxt.setPosition(closeBtnX, closeBtnY);

    const closeBtnBg = this.add
      .rectangle(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 0x182b49, 0.95)
      .setStrokeStyle(1.5, 0x334155)
      .setInteractive({ useHandCursor: true });

    closeBtnBg.on("pointerover", () => closeBtnBg.setFillStyle(0x243b61, 1));
    closeBtnBg.on("pointerout", () => closeBtnBg.setFillStyle(0x182b49, 0.95));
    closeBtnBg.on("pointerdown", () => this.closeScene());

    const maxBadgeW = closeBtnX - closeBtnW / 2 - 52;
    const badge = this.add.text(
      40,
      headerY + 8,
      meta.categoryBadge,
      gameText("11px", {
        fontStyle: "bold",
        color: "#00d9ff",
        wordWrap: { width: maxBadgeW },
      }),
    );
    const subBadge = this.add.text(
      40,
      badge.y + badge.height + 2,
      meta.npcBadge,
      gameText("13px", {
        fontStyle: "bold",
        color: "#f0f6fc",
        wordWrap: { width: maxBadgeW },
      }),
    );
    this.headerRoot.add([badge, subBadge, closeBtnBg, closeBtnTxt]);

    // Прогресс-бар (4 этапа)
    const barX = 40;
    const barY = subBadge.y + subBadge.height + 7;
    const barW = Math.floor((headerW - 32) * 0.38);
    const barH = 9;

    const barTrack = this.add.graphics();
    barTrack.fillStyle(0x060d1f, 1);
    barTrack.fillRoundedRect(barX, barY, barW, barH, 5);
    barTrack.lineStyle(1, 0x1e293b, 1);
    barTrack.strokeRoundedRect(barX, barY, barW, barH, 5);
    this.headerRoot.add(barTrack);

    if (pct > 0) {
      const barFill = this.add.graphics();
      barFill.fillStyle(pct === 100 ? 0x10b981 : 0x00d9ff, 1);
      barFill.fillRoundedRect(barX, barY, Math.max(12, (barW * pct) / 100), barH, 5);
      this.headerRoot.add(barFill);
    }

    const progressText = this.add.text(
      barX,
      barY + barH + 3,
      `${meta.progressLabel}: ${pct}% · ${
        remaining === 0 ? meta.allDoneLabel : `${meta.remainingLabel}: ${remaining}`
      }`,
      gameText("11px", {
        fontStyle: "bold",
        color: pct === 100 ? "#34d399" : "#94a3b8",
        wordWrap: { width: barW },
      }),
    );
    this.headerRoot.add(progressText);

    // 4 плашки этапов справа от прогресс-бара
    const pillStartX = barX + barW + 16;
    const pillsTotalW = headerX + headerW - 14 - pillStartX;
    const pillGap = 6;
    const pillW = Math.floor((pillsTotalW - pillGap * 3) / 4);

    const pillLabels = meta.stageNames.map((stageName, idx) => {
      const stageNum = (idx + 1) as StageId;
      const isDone = this.stage > stageNum || this.stage === 5;
      const isCurrent = this.stage === stageNum;
      const textColor = isDone ? "#6ee7b7" : isCurrent ? "#7dd3fc" : "#64748b";

      return this.add
        .text(
          0,
          0,
          isDone ? `✓ ${stageName}` : stageName,
          gameText("10.5px", {
            fontStyle: "bold",
            color: textColor,
            align: "center",
            wordWrap: { width: pillW - 10 },
          }),
        )
        .setOrigin(0.5);
    });

    const maxPillTextH = Math.max(...pillLabels.map((lbl) => lbl.height));
    const pillH = Math.max(24, maxPillTextH + 8);
    const pillCenterY = barY + Math.max(barH + 4, pillH / 2 - 2);

    pillLabels.forEach((label, idx) => {
      const stageNum = (idx + 1) as StageId;
      const isDone = this.stage > stageNum || this.stage === 5;
      const isCurrent = this.stage === stageNum;
      const px = pillStartX + idx * (pillW + pillGap) + pillW / 2;

      const fill = isDone ? 0x064e3b : isCurrent ? 0x0c365a : 0x091326;
      const stroke = isDone ? 0x10b981 : isCurrent ? 0x00d9ff : 0x1e293b;

      const pill = this.add
        .rectangle(px, pillCenterY, pillW, pillH, fill, 0.95)
        .setStrokeStyle(1.5, stroke);
      label.setPosition(px, pillCenterY);

      this.headerRoot?.add([pill, label]);
    });

    const contentBottom = Math.max(
      progressText.y + progressText.height,
      pillCenterY + pillH / 2,
    );
    const headerH = contentBottom - headerY + 8;
    this.headerBottom = headerY + headerH;

    headerBg.fillStyle(0x0f1f3a, 0.95);
    headerBg.fillRoundedRect(headerX, headerY, headerW, headerH, 14);
    headerBg.lineStyle(1.5, 0x1e3a5f, 0.9);
    headerBg.strokeRoundedRect(headerX, headerY, headerW, headerH, 14);
  }

  private renderStageHeading(titleStr: string, subtitleStr: string): number {
    if (!this.stageRoot) return this.headerBottom + 60;
    const { width } = viewSize(this);
    const topY = this.headerBottom + 6;

    const title = this.add.text(
      36,
      topY,
      titleStr,
      gameText("16.5px", {
        fontStyle: "900",
        color: "#ffffff",
        wordWrap: { width: width - 72 },
      }),
    );
    const subtitle = this.add.text(
      36,
      title.y + title.height + 2,
      subtitleStr,
      gameText("12px", {
        color: "#94a3b8",
        wordWrap: { width: width - 72 },
      }),
    );
    this.stageRoot.add([title, subtitle]);

    return subtitle.y + subtitle.height + 7;
  }

  private renderCurrentStage() {
    this.isTransitioning = false;
    this.stageRoot?.destroy(true);
    this.stageRoot = this.add.container(0, 0);
    this.xrayReticle = undefined;
    this.tunnelGraphics = undefined;
    this.sessionPulseGraphics = undefined;

    this.renderHeader();

    if (this.stage === 0) {
      this.renderStage0Intro();
    } else if (this.stage === 1) {
      this.renderStage1ProfileXray();
    } else if (this.stage === 2) {
      this.renderStage2LoginTraps();
    } else if (this.stage === 3) {
      this.renderStage3ActiveSessions();
    } else if (this.stage === 4) {
      this.renderStage4DefenseShields();
    } else {
      this.renderStage5Victory();
    }
  }

  private renderStage0Intro() {
    if (!this.stageRoot) return;
    const { width, height } = viewSize(this);
    const meta = HACKED_ACCOUNT_META[this.locale];
    const npc = PATROL_NPCS.find((item) => item.id === "shop-seller");
    const npcName = npc?.name[this.locale] ?? "";
    const situation = npc?.situation[this.locale] ?? "";

    const cardW = width - 160;
    const cardX = 80;

    const cardBg = this.add.graphics();
    this.stageRoot.add(cardBg);

    const sprite = this.add.image(width / 2, 0, "npc-male", "idle").setScale(0.5);
    if (npc?.tint !== undefined) sprite.setTint(npc.tint);

    const nameTxt = this.add
      .text(
        width / 2,
        0,
        npcName,
        gameText("20px", {
          fontStyle: "bold",
          color: "#ffd166",
          wordWrap: { width: cardW - 96 },
          align: "center",
        }),
      )
      .setOrigin(0.5, 0);

    const situationTxt = this.add
      .text(
        width / 2,
        0,
        situation,
        gameText("17px", {
          fontStyle: "bold",
          color: "#f8fafc",
          wordWrap: { width: cardW - 96 },
          align: "center",
          lineSpacing: 6,
        }),
      )
      .setOrigin(0.5, 0);

    const btnTxt = this.add
      .text(
        width / 2,
        0,
        meta.introActionBtn,
        gameText("16px", {
          fontStyle: "900",
          color: "#040916",
        }),
      )
      .setOrigin(0.5);

    const btnW = Math.max(240, btnTxt.width + 48);
    const btnH = Math.max(48, btnTxt.height + 20);

    const innerH = 88 + nameTxt.height + 14 + situationTxt.height + 24 + btnH + 28;
    const cardH = Math.max(300, innerH);
    const cardY = Math.max(
      this.headerBottom + 12,
      this.headerBottom + (height - this.headerBottom - cardH) / 2,
    );

    cardBg.fillStyle(0x0c1930, 0.96);
    cardBg.fillRoundedRect(cardX, cardY, cardW, cardH, 22);
    cardBg.lineStyle(2, 0x00d9ff, 0.7);
    cardBg.strokeRoundedRect(cardX, cardY, cardW, cardH, 22);

    sprite.setPosition(width / 2, cardY + 54);
    nameTxt.setY(cardY + 96);
    situationTxt.setY(nameTxt.y + nameTxt.height + 14);

    const btnX = width / 2;
    const btnY = situationTxt.y + situationTxt.height + 24 + btnH / 2;
    btnTxt.setPosition(btnX, btnY);

    const btnBg = this.add
      .rectangle(btnX, btnY, btnW, btnH, 0x00d9ff, 1)
      .setStrokeStyle(2, 0x7dd3fc)
      .setInteractive({ useHandCursor: true });

    btnBg.on("pointerover", () => btnBg.setFillStyle(0x38bdf8, 1));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x00d9ff, 1));
    btnBg.on("pointerdown", () => {
      this.stage = 1;
      this.renderCurrentStage();
    });

    this.stageRoot.add([sprite, nameTxt, situationTxt, btnBg, btnTxt]);
  }

  // ============================================================================
  // ЭТАП 1: РЕНТГЕН ПРОФИЛЯ ПРОДАВЦА (ПОИСК 3 УЛИК ВЗЛОМА)
  // ============================================================================
  private renderStage1ProfileXray() {
    if (!this.stageRoot) return;
    const { width, height } = viewSize(this);
    const meta = HACKED_ACCOUNT_META[this.locale];

    const panelY = this.renderStageHeading(meta.stage1Title, meta.stage1Subtitle);
    const colGap = 20;
    const cardX = 36;
    const cardW = Math.floor((width - 72 - colGap) / 2);
    const rightX = cardX + cardW + colGap;
    const rightW = width - 36 - rightX;
    const minPanelH = height - panelY - 18;

    // Левая панель: Карточка профиля продавца в соцсети/маркетплейсе
    const cardFrame = this.add.graphics();
    this.stageRoot.add(cardFrame);

    const profileHeader = this.add
      .text(
        cardX + cardW / 2,
        panelY + 10,
        meta.stage1HeaderBadge,
        gameText("11px", {
          fontStyle: "bold",
          color: "#38bdf8",
          align: "center",
          wordWrap: { width: cardW - 32 },
        }),
      )
      .setOrigin(0.5, 0);
    this.stageRoot.add(profileHeader);

    // Правая панель: Отчёт рентген-сканера и список найденных улик
    const rightBox = this.add.graphics();
    this.stageRoot.add(rightBox);

    const flagSpots = HACKED_PROFILE_SPOTS.filter((s) => s.isFlag);
    const totalFlags = flagSpots.length;

    const scanCounterText = this.add.text(
      rightX + 18,
      panelY + 10,
      `${meta.stage1ScanHint}${this.scannedFlagIds.size}/${totalFlags})`,
      gameText("12.5px", {
        fontStyle: "bold",
        color: "#00d9ff",
        wordWrap: { width: rightW - 36 },
      }),
    );

    const findingBoxBg = this.add.graphics();
    const findingBoxX = rightX + 16;
    const findingBoxW = rightW - 32;
    let findingBoxY = scanCounterText.y + scanCounterText.height + 6;

    const findingTitleText = this.add.text(
      findingBoxX + 12,
      findingBoxY + 8,
      meta.stage1SelectHint,
      gameText("13px", {
        fontStyle: "bold",
        color: "#f8fafc",
        wordWrap: { width: findingBoxW - 24 },
      }),
    );

    const findingDescText = this.add.text(
      findingBoxX + 12,
      findingTitleText.y + findingTitleText.height + 4,
      meta.stage1BehaviorHint,
      gameText("11.5px", {
        color: "#cbd5e1",
        lineSpacing: 2,
        wordWrap: { width: findingBoxW - 24 },
      }),
    );
    this.stageRoot.add([scanCounterText, findingBoxBg, findingTitleText, findingDescText]);

    // Список 3 улик
    const flagsListContainer = this.add.container(findingBoxX, 0);
    this.stageRoot.add(flagsListContainer);

    // Рендерим 5 интерактивных зон профиля продавца по высоте содержимого
    let curSpotY = profileHeader.y + profileHeader.height + 8;
    const spotW = cardW - 28;
    const centerX = cardX + cardW / 2;
    const spotGap = 6;

    const relayoutRightPanel = (leftPanelH: number) => {
      findingBoxY = scanCounterText.y + scanCounterText.height + 6;
      findingTitleText.setY(findingBoxY + 8);
      findingDescText.setY(findingTitleText.y + findingTitleText.height + 4);

      const findingBoxH = Math.max(
        76,
        findingDescText.y + findingDescText.height - findingBoxY + 10,
      );
      findingBoxBg.clear();
      findingBoxBg.fillStyle(0x071124, 0.95);
      findingBoxBg.fillRoundedRect(findingBoxX, findingBoxY, findingBoxW, findingBoxH, 12);
      findingBoxBg.lineStyle(1.5, 0x334155, 0.9);
      findingBoxBg.strokeRoundedRect(findingBoxX, findingBoxY, findingBoxW, findingBoxH, 12);

      const listStartY = findingBoxY + findingBoxH + 8;
      flagsListContainer.setPosition(findingBoxX, listStartY);
      flagsListContainer.removeAll(true);

      let rowTop = 0;

      flagSpots.forEach((flag, idx) => {
        const found = this.scannedFlagIds.has(flag.id);
        const rowTxt = this.add.text(
          10,
          rowTop + 6,
          found
            ? `✓ ${flag.findingTitle[this.locale]}`
            : `${idx + 1}. ${meta.stage1HiddenClueLabel}`,
          gameText("11.5px", {
            fontStyle: "bold",
            color: found ? "#6ee7b7" : "#64748b",
            wordWrap: { width: findingBoxW - 20 },
          }),
        );
        const rowH = Math.max(28, rowTxt.height + 12);
        const rowBg = this.add
          .rectangle(
            findingBoxW / 2,
            rowTop + rowH / 2,
            findingBoxW,
            rowH,
            found ? 0x064e3b : 0x091326,
            0.9,
          )
          .setStrokeStyle(1, found ? 0x10b981 : 0x1e293b);

        flagsListContainer.add([rowBg, rowTxt]);
        rowTop += rowH + 5;
      });

      if (this.scannedFlagIds.size >= totalFlags) {
        const nextTxt = this.add
          .text(
            findingBoxW / 2,
            0,
            meta.nextStageBtn,
            gameText("13.5px", {
              fontStyle: "900",
              color: "#041022",
              align: "center",
              wordWrap: { width: findingBoxW - 24 },
            }),
          )
          .setOrigin(0.5);
        const nextBtnH = Math.max(38, nextTxt.height + 14);
        const nextBtnY = rowTop + 3 + nextBtnH / 2;
        nextTxt.setY(nextBtnY);

        const nextBtn = this.add
          .rectangle(findingBoxW / 2, nextBtnY, findingBoxW, nextBtnH, 0x00d9ff, 1)
          .setStrokeStyle(2, 0xbae6fd)
          .setInteractive({ useHandCursor: true });

        nextBtn.on("pointerover", () => nextBtn.setFillStyle(0x38bdf8, 1));
        nextBtn.on("pointerout", () => nextBtn.setFillStyle(0x00d9ff, 1));
        nextBtn.on("pointerdown", () => {
          this.stage = 2;
          this.renderCurrentStage();
        });

        flagsListContainer.add([nextBtn, nextTxt]);
        rowTop += 3 + nextBtnH;
      }

      const rightNeededH = listStartY + rowTop - panelY + 10;
      const finalPanelH = Math.max(minPanelH, leftPanelH, rightNeededH);

      rightBox.clear();
      rightBox.fillStyle(0x0c1930, 0.95);
      rightBox.fillRoundedRect(rightX, panelY, rightW, finalPanelH, 18);
      rightBox.lineStyle(1.5, 0x1e3a5f, 0.9);
      rightBox.strokeRoundedRect(rightX, panelY, rightW, finalPanelH, 18);

      cardFrame.clear();
      cardFrame.fillStyle(0x071022, 1);
      cardFrame.fillRoundedRect(cardX, panelY, cardW, finalPanelH, 20);
      cardFrame.lineStyle(2.5, 0x38bdf8, 0.75);
      cardFrame.strokeRoundedRect(cardX, panelY, cardW, finalPanelH, 20);
    };

    HACKED_PROFILE_SPOTS.forEach((spot) => {
      const isAlreadyFound = this.scannedFlagIds.has(spot.id);
      const tagColW = 92;
      const textWrapW = spotW - tagColW - 20;

      const labelTxt = this.add.text(
        cardX + 24,
        curSpotY + 6,
        spot.label[this.locale],
        gameText("12px", {
          fontStyle: "bold",
          color: "#f8fafc",
          wordWrap: { width: textWrapW },
        }),
      );

      const subTxt = this.add.text(
        cardX + 24,
        labelTxt.y + labelTxt.height + 2,
        spot.sublabel[this.locale],
        gameText("10.5px", {
          color: "#94a3b8",
          wordWrap: { width: textWrapW },
        }),
      );

      const statusTag = this.add
        .text(
          0,
          0,
          isAlreadyFound ? meta.stage1ClueTag : meta.stage1CheckTag,
          gameText("10px", {
            fontStyle: "bold",
            color: isAlreadyFound ? "#fda4af" : "#38bdf8",
            align: "center",
          }),
        )
        .setOrigin(0.5);

      const textBottom = subTxt.y + subTxt.height;
      const spotH = Math.max(44, textBottom - curSpotY + 6, statusTag.height + 16);
      const spotCenterY = curSpotY + spotH / 2;

      statusTag.setPosition(cardX + cardW - 14 - tagColW / 2, spotCenterY);

      const spotBg = this.add
        .rectangle(
          centerX,
          spotCenterY,
          spotW,
          spotH,
          isAlreadyFound ? 0x3b0a1e : 0x101f38,
          0.95,
        )
        .setStrokeStyle(1.5, isAlreadyFound ? 0xf43f5e : 0x264066)
        .setInteractive({ useHandCursor: true });

      spotBg.on("pointerover", () => {
        if (!this.scannedFlagIds.has(spot.id)) {
          spotBg.setStrokeStyle(2, 0x00d9ff);
          spotBg.setFillStyle(0x162b4d, 1);
        }
      });

      spotBg.on("pointerout", () => {
        if (!this.scannedFlagIds.has(spot.id)) {
          spotBg.setStrokeStyle(1.5, 0x264066);
          spotBg.setFillStyle(0x101f38, 0.95);
        }
      });

      spotBg.on("pointerdown", () => {
        if (spot.isFlag) {
          this.scannedFlagIds.add(spot.id);
          spotBg.setFillStyle(0x3b0a1e, 0.95);
          spotBg.setStrokeStyle(2, 0xf43f5e);
          statusTag.setText(meta.stage1ClueTag).setColor("#fda4af");

          findingTitleText.setText(spot.findingTitle[this.locale]).setColor("#fda4af");
          findingDescText.setText(spot.findingDesc[this.locale]);

          scanCounterText.setText(`${meta.stage1ScanHint}${this.scannedFlagIds.size}/${totalFlags})`);
          relayoutRightPanel(leftPanelH);
          this.renderHeader();
        } else {
          this.mistakesCount += 1;
          spotBg.setFillStyle(0x0b2e28, 0.95);
          spotBg.setStrokeStyle(1.5, 0x10b981);
          statusTag.setText(meta.stage1NormTag).setColor("#6ee7b7");

          findingTitleText.setText(spot.findingTitle[this.locale]).setColor("#6ee7b7");
          findingDescText.setText(spot.findingDesc[this.locale]);
          relayoutRightPanel(leftPanelH);
        }
      });

      this.stageRoot?.add([spotBg, labelTxt, subTxt, statusTag]);
      curSpotY += spotH + spotGap;
    });

    const leftPanelH = Math.max(minPanelH, curSpotY - panelY + 6);
    relayoutRightPanel(leftPanelH);

    // Прицел рентген-сканера
    const reticle = this.add.container(cardX + cardW / 2, panelY + leftPanelH / 2);
    const rCircle = this.add.graphics();
    rCircle.lineStyle(2, 0x38bdf8, 0.85);
    rCircle.strokeCircle(0, 0, 22);
    rCircle.lineBetween(-30, 0, -12, 0);
    rCircle.lineBetween(12, 0, 30, 0);
    rCircle.lineBetween(0, -30, 0, -12);
    rCircle.lineBetween(0, 12, 0, 30);
    reticle.add(rCircle);
    this.xrayReticle = reticle;
    this.stageRoot.add(reticle);

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.stage === 1 && this.xrayReticle && this.xrayReticle.scene) {
        const clampedX = Phaser.Math.Clamp(pointer.worldX, cardX + 28, cardX + cardW - 28);
        const clampedY = Phaser.Math.Clamp(pointer.worldY, panelY + 28, panelY + leftPanelH - 28);
        this.xrayReticle.setPosition(clampedX, clampedY);
      }
    });
  }

  // ============================================================================
  // ЭТАП 2: ЛОВУШКА ФЕЙКОВОГО ВХОДА И QR-КОДА (3 КИБЕР-БАРЬЕРА)
  // ============================================================================
  private renderStage2LoginTraps() {
    if (!this.stageRoot) return;
    const { width } = viewSize(this);
    const meta = HACKED_ACCOUNT_META[this.locale];
    const currentTrap = HACKED_LOGIN_TRAPS[this.trapIndex];

    const scopeY = this.renderStageHeading(meta.stage2Title, meta.stage2Subtitle);
    const scopeX = 36;
    const scopeW = width - 72;

    const scopeBg = this.add.graphics();
    this.stageRoot.add(scopeBg);

    this.tunnelGraphics = this.add.graphics();
    this.stageRoot.add(this.tunnelGraphics);

    const trapCounter = this.add.text(
      scopeX + 20,
      scopeY + 12,
      `${meta.stage2TrapBadge(this.trapIndex + 1)} · ${currentTrap.trapMechanism[this.locale]}`,
      gameText("11.5px", {
        fontStyle: "bold",
        color: this.trapSolved ? "#34d399" : "#fda4af",
        wordWrap: { width: scopeW - 40 },
      }),
    );

    const quoteTxt = this.add
      .text(
        scopeX + scopeW / 2,
        trapCounter.y + trapCounter.height + 10,
        currentTrap.attackerMessage[this.locale],
        gameText("14px", {
          fontStyle: "bold",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: scopeW - 56 },
        }),
      )
      .setOrigin(0.5, 0);

    this.tunnelY = quoteTxt.y + quoteTxt.height + 24;
    this.drawDataTunnel();

    // Поле обратной связи под линией туннеля
    const feedbackText = this.add
      .text(
        scopeX + scopeW / 2,
        this.tunnelY + 22,
        this.trapSolved
          ? currentTrap.successFeedback[this.locale]
          : meta.stage2FeedbackDefault,
        gameText("12.5px", {
          fontStyle: "bold",
          color: this.trapSolved ? "#6ee7b7" : "#94a3b8",
          align: "center",
          wordWrap: { width: scopeW - 56 },
        }),
      )
      .setOrigin(0.5, 0);

    this.stageRoot.add([trapCounter, quoteTxt, feedbackText]);

    const scopeH = Math.max(
      188,
      feedbackText.y + feedbackText.height - scopeY + 16,
    );
    const drawScopeFrame = (h: number) => {
      scopeBg.clear();
      scopeBg.fillStyle(0x050c1a, 0.98);
      scopeBg.fillRoundedRect(scopeX, scopeY, scopeW, h, 16);
      scopeBg.lineStyle(2, this.trapSolved ? 0x10b981 : 0xf43f5e, 0.85);
      scopeBg.strokeRoundedRect(scopeX, scopeY, scopeW, h, 16);
    };
    drawScopeFrame(scopeH);

    // 3 кнопки кибер-барьеров (ширина от this.scale.width, высота по тексту)
    const btnGap = 18;
    const btnW = Math.floor((width - 72 - btnGap * 2) / 3);

    if (this.stage2ShuffledTrapIndex !== this.trapIndex) {
      this.stage2ShuffledBlockers = shuffle(
        meta.stage2Blockers.map((blockerLabel, idx) => ({
          id: `blocker-${idx}`,
          label: blockerLabel,
          isCorrect: idx === currentTrap.correctBlockerIndex,
        })),
      );
      this.stage2ShuffledTrapIndex = this.trapIndex;
    }

    const btnTexts = this.stage2ShuffledBlockers.map((item) =>
      this.add
        .text(
          0,
          0,
          item.label,
          gameText("12.5px", {
            fontStyle: "bold",
            color: "#f8fafc",
            align: "center",
            wordWrap: { width: btnW - 24 },
          }),
        )
        .setOrigin(0.5),
    );
    const maxBtnTextH = Math.max(...btnTexts.map((t) => t.height));
    const btnH = Math.max(64, maxBtnTextH + 24);
    const btnY = scopeY + scopeH + 16 + btnH / 2;

    btnTexts.forEach((btnTxt, idx) => {
      const bx = 36 + idx * (btnW + btnGap) + btnW / 2;
      const isCorrectChoice = this.stage2ShuffledBlockers[idx]?.isCorrect ?? false;

      const btnBg = this.add
        .rectangle(
          bx,
          btnY,
          btnW,
          btnH,
          this.trapSolved && isCorrectChoice ? 0x064e3b : 0x10203b,
          0.95,
        )
        .setStrokeStyle(
          2,
          this.trapSolved && isCorrectChoice ? 0x10b981 : 0x00d9ff,
        )
        .setInteractive({ useHandCursor: true });

      btnTxt.setPosition(bx, btnY);

      btnBg.on("pointerover", () => {
        if (!this.trapSolved) btnBg.setFillStyle(0x1a335c, 1);
      });
      btnBg.on("pointerout", () => {
        if (!this.trapSolved) btnBg.setFillStyle(0x10203b, 0.95);
      });

      btnBg.on("pointerdown", () => {
        if (this.trapSolved) return;
        if (isCorrectChoice) {
          this.trapSolved = true;
          this.renderCurrentStage();
        } else {
          this.mistakesCount += 1;
          btnBg.setFillStyle(0x4c0519, 0.95);
          btnBg.setStrokeStyle(2, 0xf43f5e);
          feedbackText
            .setText(currentTrap.wrongFeedback[this.locale])
            .setColor("#fda4af");
          const newScopeH = Math.max(
            scopeH,
            feedbackText.y + feedbackText.height - scopeY + 14,
          );
          drawScopeFrame(newScopeH);
          this.cameras.main.shake(120, 0.004);
        }
      });

      this.stageRoot?.add([btnBg, btnTxt]);
    });

    if (this.trapSolved) {
      const isLastTrap = this.trapIndex >= HACKED_LOGIN_TRAPS.length - 1;
      const nextTxt = this.add
        .text(
          width / 2,
          0,
          isLastTrap ? meta.nextStageBtn : meta.stage2NextTrapBtn,
          gameText("14px", {
            fontStyle: "900",
            color: "#041022",
            align: "center",
          }),
        )
        .setOrigin(0.5);

      const nextBtnW = Math.max(420, nextTxt.width + 48);
      const nextBtnH = Math.max(42, nextTxt.height + 16);
      const nextBtnY = btnY + btnH / 2 + 14 + nextBtnH / 2;
      nextTxt.setY(nextBtnY);

      const nextBtn = this.add
        .rectangle(width / 2, nextBtnY, nextBtnW, nextBtnH, 0x00d9ff, 1)
        .setStrokeStyle(2, 0xbae6fd)
        .setInteractive({ useHandCursor: true });

      nextBtn.on("pointerdown", () => {
        if (isLastTrap) {
          this.stage = 3;
          this.renderCurrentStage();
        } else {
          this.trapIndex += 1;
          this.trapSolved = false;
          this.renderCurrentStage();
        }
      });

      this.stageRoot.add([nextBtn, nextTxt]);
    }
  }

  private drawDataTunnel() {
    if (!this.tunnelGraphics) return;
    this.tunnelGraphics.clear();

    const { width } = viewSize(this);
    const startX = 110;
    const endX = width - 110;
    const midX = width / 2;
    const y = this.tunnelY;

    const lineColor = this.trapSolved ? 0x10b981 : 0xf43f5e;
    this.tunnelGraphics.lineStyle(3, lineColor, 0.45);
    this.tunnelGraphics.lineBetween(startX, y, this.trapSolved ? midX : endX, y);

    // Барьер посередине
    if (this.trapSolved) {
      this.tunnelGraphics.fillStyle(0x10b981, 0.9);
      this.tunnelGraphics.fillRoundedRect(midX - 8, y - 16, 16, 32, 6);
    } else {
      // Бегущие пакеты данных к серверу Тени
      for (let i = 0; i < 4; i++) {
        const t = (this.tunnelPhase + i * 0.25) % 1;
        const px = Phaser.Math.Linear(startX, endX, t);
        this.tunnelGraphics.fillStyle(0xf43f5e, 0.95);
        this.tunnelGraphics.fillCircle(px, y, 5);
      }
    }
  }

  // ============================================================================
  // ЭТАП 3: ДИСПЕТЧЕР АКТИВНЫХ СЕССИЙ (ОТКЛЮЧЕНИЕ 3 СЕССИЙ ХАКЕРА)
  // ============================================================================
  private renderStage3ActiveSessions() {
    if (!this.stageRoot) return;
    const { width } = viewSize(this);
    const meta = HACKED_ACCOUNT_META[this.locale];

    const startY = this.renderStageHeading(meta.stage3Title, meta.stage3Subtitle);

    // 4 карточки устройств (2x2 сетка, высота каждой строки по содержимому)
    const startX = 36;
    const gapX = 20;
    const gapY = 10;
    const cardW = Math.floor((width - 72 - gapX) / 2);

    const totalHackerSessions = HACKED_SESSIONS.filter((s) => s.isHacker).length;

    const statusBg = this.add.graphics();
    const statusToast = this.add
      .text(
        width / 2,
        0,
        this.killedSessionIds.size >= totalHackerSessions
          ? meta.stage3AllKilledNotice
          : meta.stage3KilledCounter(this.killedSessionIds.size, totalHackerSessions),
        gameText("12.5px", {
          fontStyle: "bold",
          color: this.killedSessionIds.size >= totalHackerSessions ? "#34d399" : "#38bdf8",
          align: "center",
          wordWrap: { width: width - 160 },
        }),
      )
      .setOrigin(0.5, 0);

    let statusTopY = 0;
    const updateStatusBanner = (text: string, color: string) => {
      statusToast.setText(text).setColor(color);
      statusToast.setY(statusTopY + 6);
      const boxW = Math.min(width - 72, Math.max(320, statusToast.width + 36));
      const boxH = statusToast.height + 12;
      const boxX = (width - boxW) / 2;

      statusBg.clear();
      statusBg.fillStyle(0x061020, 0.96);
      statusBg.fillRoundedRect(boxX, statusTopY, boxW, boxH, 10);
      statusBg.lineStyle(1.5, 0x1e3a5f, 0.9);
      statusBg.strokeRoundedRect(boxX, statusTopY, boxW, boxH, 10);

      this.sessionWaveY = statusTopY + boxH / 2;
      this.sessionWaveGapLeft = boxX - 12;
      this.sessionWaveGapRight = boxX + boxW + 12;
      this.drawSessionActivityWave();
      return statusTopY + boxH;
    };

    let rowY = startY;
    for (let row = 0; row < 2; row++) {
      const rowItems = HACKED_SESSIONS.slice(row * 2, row * 2 + 2);

      const prepared = rowItems.map((sess, col) => {
        const cx = startX + col * (cardW + gapX);
        const isKilled = this.killedSessionIds.has(sess.id);
        const isOwner = !sess.isHacker;

        const devTitle = this.add.text(
          cx + 16,
          rowY + 10,
          sess.deviceTitle[this.locale],
          gameText("12.5px", {
            fontStyle: "900",
            color: "#ffffff",
            wordWrap: { width: cardW - 32 },
          }),
        );

        const locMeta = this.add.text(
          cx + 16,
          devTitle.y + devTitle.height + 3,
          sess.locationMeta[this.locale],
          gameText("10.5px", {
            color: isOwner ? "#7dd3fc" : isKilled ? "#6ee7b7" : "#fda4af",
            wordWrap: { width: cardW - 32 },
          }),
        );

        const activityTxt = this.add.text(
          cx + 16,
          locMeta.y + locMeta.height + 4,
          isKilled ? `✓ ${sess.explanation[this.locale]}` : sess.liveActivity[this.locale],
          gameText("11px", {
            fontStyle: "bold",
            color: isKilled ? "#a7f3d0" : "#e2e8f0",
            wordWrap: { width: cardW - 32 },
          }),
        );

        const btnLabel = isOwner
          ? meta.stage3OwnerBadge
          : isKilled
            ? meta.stage3KilledBadge
            : meta.stage3KillBtn;

        const actionTxt = this.add
          .text(
            cx + cardW / 2,
            0,
            btnLabel,
            gameText("11.5px", {
              fontStyle: "900",
              color: "#ffffff",
              align: "center",
              wordWrap: { width: cardW - 48 },
            }),
          )
          .setOrigin(0.5);

        const btnH = Math.max(30, actionTxt.height + 10);
        const contentBottom = activityTxt.y + activityTxt.height;
        const neededCardH = contentBottom - rowY + 8 + btnH + 10;

        return {
          sess,
          cx,
          isKilled,
          isOwner,
          devTitle,
          locMeta,
          activityTxt,
          actionTxt,
          btnH,
          neededCardH,
        };
      });

      const rowCardH = Math.max(126, ...prepared.map((p) => p.neededCardH));

      prepared.forEach((p) => {
        const cardBg = this.add.graphics();
        cardBg.fillStyle(
          p.isOwner ? 0x092230 : p.isKilled ? 0x062e24 : 0x260b18,
          0.95,
        );
        cardBg.fillRoundedRect(p.cx, rowY, cardW, rowCardH, 14);
        cardBg.lineStyle(
          2,
          p.isOwner ? 0x00d9ff : p.isKilled ? 0x10b981 : 0xf43f5e,
          0.9,
        );
        cardBg.strokeRoundedRect(p.cx, rowY, cardW, rowCardH, 14);

        const btnFill = p.isOwner ? 0x0f3156 : p.isKilled ? 0x065f46 : 0xe11d48;
        const btnStroke = p.isOwner ? 0x38bdf8 : p.isKilled ? 0x34d399 : 0xfda4af;
        const btnY = rowY + rowCardH - 10 - p.btnH / 2;

        const actionBtn = this.add
          .rectangle(p.cx + cardW / 2, btnY, cardW - 32, p.btnH, btnFill, 1)
          .setStrokeStyle(1.5, btnStroke)
          .setInteractive({ useHandCursor: !p.isKilled });

        p.actionTxt.setPosition(p.cx + cardW / 2, btnY);

        actionBtn.on("pointerdown", () => {
          if (p.isOwner) {
            this.mistakesCount += 1;
            updateStatusBanner(p.sess.explanation[this.locale], "#7dd3fc");
            return;
          }
          if (!this.killedSessionIds.has(p.sess.id)) {
            this.killedSessionIds.add(p.sess.id);
            this.renderCurrentStage();
          }
        });

        this.stageRoot?.add([
          cardBg,
          p.devTitle,
          p.locMeta,
          p.activityTxt,
          actionBtn,
          p.actionTxt,
        ]);
      });

      rowY += rowCardH + gapY;
    }

    this.sessionPulseGraphics = this.add.graphics();
    this.stageRoot.add([this.sessionPulseGraphics, statusBg, statusToast]);

    statusTopY = rowY - gapY + 6;
    const statusBottomY = updateStatusBanner(
      this.killedSessionIds.size >= totalHackerSessions
        ? meta.stage3AllKilledNotice
        : meta.stage3KilledCounter(this.killedSessionIds.size, totalHackerSessions),
      this.killedSessionIds.size >= totalHackerSessions ? "#34d399" : "#38bdf8",
    );

    if (this.killedSessionIds.size >= totalHackerSessions) {
      const nextTxt = this.add
        .text(
          width / 2,
          0,
          meta.nextStageBtn,
          gameText("13.5px", {
            fontStyle: "900",
            color: "#041022",
            align: "center",
          }),
        )
        .setOrigin(0.5);

      const nextBtnW = Math.max(410, nextTxt.width + 48);
      const nextBtnH = Math.max(36, nextTxt.height + 14);
      const nextBtnY = statusBottomY + 6 + nextBtnH / 2;
      nextTxt.setY(nextBtnY);

      const nextBtn = this.add
        .rectangle(width / 2, nextBtnY, nextBtnW, nextBtnH, 0x00d9ff, 1)
        .setStrokeStyle(2, 0xbae6fd)
        .setInteractive({ useHandCursor: true });

      nextBtn.on("pointerdown", () => {
        this.stage = 4;
        this.renderCurrentStage();
      });

      this.stageRoot.add([nextBtn, nextTxt]);
    }
  }

  private drawSessionActivityWave() {
    if (!this.sessionPulseGraphics) return;
    this.sessionPulseGraphics.clear();

    const { width } = viewSize(this);
    const totalHackerSessions = HACKED_SESSIONS.filter((s) => s.isHacker).length;
    const allClean = this.killedSessionIds.size >= totalHackerSessions;
    const color = allClean ? 0x10b981 : 0xf43f5e;
    const amp = allClean ? 3 : 8;

    this.sessionPulseGraphics.lineStyle(2, color, 0.35);

    // Левый сегмент до тёмной плашки статуса (не под текстом)
    const leftEnd = Math.max(40, this.sessionWaveGapLeft);
    if (leftEnd > 48) {
      this.sessionPulseGraphics.beginPath();
      for (let x = 40; x <= leftEnd; x += 6) {
        const y = this.sessionWaveY + Math.sin(x * 0.03 + this.sessionPulsePhase) * amp;
        if (x === 40) this.sessionPulseGraphics.moveTo(x, y);
        else this.sessionPulseGraphics.lineTo(x, y);
      }
      this.sessionPulseGraphics.strokePath();
    }

    // Правый сегмент после тёмной плашки статуса (не под текстом)
    const rightStart = Math.min(width - 40, this.sessionWaveGapRight);
    if (width - 40 > rightStart + 8) {
      this.sessionPulseGraphics.beginPath();
      for (let x = rightStart; x <= width - 40; x += 6) {
        const y = this.sessionWaveY + Math.sin(x * 0.03 + this.sessionPulsePhase) * amp;
        if (x === rightStart) this.sessionPulseGraphics.moveTo(x, y);
        else this.sessionPulseGraphics.lineTo(x, y);
      }
      this.sessionPulseGraphics.strokePath();
    }
  }

  // ============================================================================
  // ЭТАП 4: 3 РУБЕЖА ЗАЩИТЫ ПРОТИВ ТЕНИ (ПАРОЛЬ + 2FA + ОПОВЕЩЕНИЕ)
  // ============================================================================
  private renderStage4DefenseShields() {
    if (!this.stageRoot) return;
    const { width } = viewSize(this);
    const meta = HACKED_ACCOUNT_META[this.locale];
    const round = HACKED_SHIELD_LAYERS[this.layerRoundIndex];

    const bossY = this.renderStageHeading(meta.stage4Title, meta.stage4Subtitle);

    // Панель HP Тени и 3 рубежей защиты
    const bossX = 36;
    const bossW = width - 72;

    const bossBg = this.add.graphics();
    this.stageRoot.add(bossBg);

    const bossName = this.add.text(
      bossX + 20,
      bossY + 9,
      `${round.layerBadge[this.locale]} · ${meta.stage4HpLabel(this.shadowHp)}`,
      gameText("11.5px", {
        fontStyle: "bold",
        color: "#fda4af",
        wordWrap: { width: bossW - 40 },
      }),
    );

    // Полоска HP Тени
    const hpTrackY = bossName.y + bossName.height + 5;
    const hpTrackW = Math.min(380, bossW - 44);
    const hpTrack = this.add.graphics();
    hpTrack.fillStyle(0x090d16, 1);
    hpTrack.fillRoundedRect(bossX + 20, hpTrackY, hpTrackW, 10, 5);
    if (this.shadowHp > 0) {
      hpTrack.fillStyle(0xf43f5e, 1);
      hpTrack.fillRoundedRect(
        bossX + 20,
        hpTrackY,
        Math.max(12, (hpTrackW * this.shadowHp) / 100),
        10,
        5,
      );
    }

    const attackTxt = this.add.text(
      bossX + 20,
      hpTrackY + 15,
      round.shadowThreat[this.locale],
      gameText("13px", {
        fontStyle: "bold",
        color: "#ffffff",
        wordWrap: { width: bossW - 40 },
      }),
    );
    const bossH = attackTxt.y + attackTxt.height - bossY + 10;

    bossBg.fillStyle(0x1f0918, 0.95);
    bossBg.fillRoundedRect(bossX, bossY, bossW, bossH, 16);
    bossBg.lineStyle(2, 0xf43f5e, 0.85);
    bossBg.strokeRoundedRect(bossX, bossY, bossW, bossH, 16);

    this.stageRoot.add([bossName, hpTrack, attackTxt]);

    // Поле фидбека раунда
    const duelFeedback = this.add
      .text(
        width / 2,
        bossY + bossH + 6,
        meta.stage4StepHint(this.layerRoundIndex + 1),
        gameText("12.5px", {
          fontStyle: "bold",
          color: "#38bdf8",
          align: "center",
          wordWrap: { width: width - 72 },
        }),
      )
      .setOrigin(0.5, 0);
    this.stageRoot.add(duelFeedback);

    // 3 карты рубежей защиты (высота по содержимому, резервируем место под 2 строки фидбека)
    const gap = 18;
    const cardW = Math.floor((width - 72 - gap * 2) / 3);
    const cy = Math.max(
      duelFeedback.y + duelFeedback.height + 8,
      bossY + bossH + 40,
    );

    if (this.stage4ShuffledLayerIndex !== this.layerRoundIndex) {
      this.stage4ShuffledCards = shuffle(round.cards);
      this.stage4ShuffledLayerIndex = this.layerRoundIndex;
    }

    const preparedCards = this.stage4ShuffledCards.map((card, idx) => {
      const cx = 36 + idx * (cardW + gap);

      const cTitle = this.add.text(
        cx + 14,
        cy + 12,
        card.title[this.locale],
        gameText("13px", {
          fontStyle: "900",
          color: "#7dd3fc",
          wordWrap: { width: cardW - 28 },
        }),
      );

      const cDesc = this.add.text(
        cx + 14,
        cTitle.y + cTitle.height + 5,
        card.desc[this.locale],
        gameText("11.5px", {
          color: "#e2e8f0",
          lineSpacing: 1,
          wordWrap: { width: cardW - 28 },
        }),
      );

      const playTxt = this.add
        .text(
          cx + cardW / 2,
          0,
          meta.stage4ActivateBtn,
          gameText("11px", {
            fontStyle: "bold",
            color: "#bae6fd",
            align: "center",
            wordWrap: { width: cardW - 40 },
          }),
        )
        .setOrigin(0.5);

      const playBtnH = Math.max(28, playTxt.height + 10);
      const neededCardH = cDesc.y + cDesc.height - cy + 10 + playBtnH + 12;

      return { card, cx, cTitle, cDesc, playTxt, playBtnH, neededCardH };
    });

    const cardH = Math.max(200, ...preparedCards.map((c) => c.neededCardH));

    preparedCards.forEach(({ card, cx, cTitle, cDesc, playTxt, playBtnH }) => {
      const cardRect = this.add
        .rectangle(cx + cardW / 2, cy + cardH / 2, cardW, cardH, 0x0d1f3a, 0.96)
        .setStrokeStyle(2, 0x00d9ff)
        .setInteractive({ useHandCursor: true });

      const playBtnY = cy + cardH - 12 - playBtnH / 2;
      const playBadge = this.add
        .rectangle(cx + cardW / 2, playBtnY, cardW - 28, playBtnH, 0x16325b, 1)
        .setStrokeStyle(1, 0x38bdf8);

      playTxt.setPosition(cx + cardW / 2, playBtnY);

      cardRect.on("pointerover", () => cardRect.setFillStyle(0x163059, 1));
      cardRect.on("pointerout", () => cardRect.setFillStyle(0x0d1f3a, 0.96));

      cardRect.on("pointerdown", () => {
        if (this.isTransitioning) return;
        if (card.correct) {
          this.isTransitioning = true;
          cardRect.setFillStyle(0x064e3b, 1);
          cardRect.setStrokeStyle(2.5, 0x10b981);
          duelFeedback.setText(card.feedback[this.locale]).setColor("#6ee7b7");

          this.time.delayedCall(650, () => {
            if (this.layerRoundIndex < HACKED_SHIELD_LAYERS.length - 1) {
              this.layerRoundIndex += 1;
              this.shadowHp = Math.max(0, 100 - this.layerRoundIndex * 34);
              this.renderCurrentStage();
            } else {
              this.shadowHp = 0;
              this.stage = 5;
              this.renderCurrentStage();
            }
          });
        } else {
          this.mistakesCount += 1;
          cardRect.setFillStyle(0x4c0519, 1);
          cardRect.setStrokeStyle(2.5, 0xf43f5e);
          duelFeedback.setText(card.feedback[this.locale]).setColor("#fda4af");
          this.cameras.main.shake(140, 0.005);
        }
      });

      this.stageRoot?.add([cardRect, cTitle, cDesc, playBadge, playTxt]);
    });
  }

  // ============================================================================
  // ЭТАП 5: ФИНАЛЬНЫЙ ЭКРАН ПОБЕДЫ И ПАМЯТКА ЗАЩИТЫ АККАУНТА
  // ============================================================================
  private renderStage5Victory() {
    if (!this.stageRoot) return;
    const { width } = viewSize(this);
    const meta = HACKED_ACCOUNT_META[this.locale];
    const passed = this.mistakesCount <= 2;

    const boxX = 56;
    const boxY = this.headerBottom + 14;
    const boxW = width - 112;

    const bg = this.add.graphics();
    this.stageRoot.add(bg);

    const title = this.add
      .text(
        width / 2,
        boxY + 18,
        passed ? `🛡️ ${meta.victoryTitle}` : `⚠️ ${meta.victoryRetryNotice}`,
        gameText("20px", {
          fontStyle: "900",
          color: passed ? "#6ee7b7" : "#ffd166",
          align: "center",
          wordWrap: { width: boxW - 64 },
        }),
      )
      .setOrigin(0.5, 0);

    const sub = this.add
      .text(
        width / 2,
        title.y + title.height + 6,
        meta.victorySubtitle,
        gameText("12.5px", {
          color: "#cbd5e1",
          align: "center",
          wordWrap: { width: boxW - 80 },
        }),
      )
      .setOrigin(0.5, 0);

    this.stageRoot.add([title, sub]);

    let ruleY = sub.y + sub.height + 12;
    const ruleW = boxW - 72;

    meta.victoryRules.forEach((rule) => {
      const rTxt = this.add.text(
        boxX + 48,
        ruleY + 7,
        `✓  ${rule}`,
        gameText("12px", {
          fontStyle: "bold",
          color: "#f0fdf4",
          wordWrap: { width: ruleW - 32 },
        }),
      );

      const rH = Math.max(36, rTxt.height + 14);
      const rBg = this.add
        .rectangle(width / 2, ruleY + rH / 2, ruleW, rH, 0x0a2e2c, 0.9)
        .setStrokeStyle(1, 0x10b981);

      this.stageRoot?.add([rBg, rTxt]);
      ruleY += rH + 7;
    });

    const finishTxt = this.add
      .text(
        width / 2,
        0,
        passed ? meta.finishBtn : meta.victoryRetryNotice,
        gameText("14.5px", {
          fontStyle: "900",
          color: "#022c22",
          align: "center",
        }),
      )
      .setOrigin(0.5);

    const finishBtnW = Math.max(460, finishTxt.width + 48);
    const finishBtnH = Math.max(44, finishTxt.height + 16);
    const finishBtnY = ruleY + 6 + finishBtnH / 2;
    finishTxt.setY(finishBtnY);

    const finishBtn = this.add
      .rectangle(
        width / 2,
        finishBtnY,
        finishBtnW,
        finishBtnH,
        passed ? 0x10b981 : 0xf59e0b,
        1,
      )
      .setStrokeStyle(2, passed ? 0xa7f3d0 : 0xfde68a)
      .setInteractive({ useHandCursor: true });

    finishBtn.on("pointerover", () =>
      finishBtn.setFillStyle(passed ? 0x34d399 : 0xfbbf24, 1),
    );
    finishBtn.on("pointerout", () =>
      finishBtn.setFillStyle(passed ? 0x10b981 : 0xf59e0b, 1),
    );
    finishBtn.on("pointerdown", () => {
      const complete = this.onComplete;
      this.onComplete = undefined;
      this.scene.stop();
      complete?.(passed);
    });

    this.stageRoot.add([finishBtn, finishTxt]);

    const boxH = finishBtnY + finishBtnH / 2 - boxY + 16;
    bg.fillStyle(0x071f1e, 0.96);
    bg.fillRoundedRect(boxX, boxY, boxW, boxH, 20);
    bg.lineStyle(2.5, passed ? 0x10b981 : 0xf59e0b, 0.95);
    bg.strokeRoundedRect(boxX, boxY, boxW, boxH, 20);
  }

  private closeScene() {
    const close = this.onClose;
    this.onClose = undefined;
    this.scene.stop();
    close?.();
  }
}
