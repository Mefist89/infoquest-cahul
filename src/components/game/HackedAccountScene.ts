import Phaser from "phaser";

import type { PatrolLocale } from "@/data/patrol";
import {
  HACKED_ACCOUNT_META,
  HACKED_LOGIN_TRAPS,
  HACKED_PROFILE_SPOTS,
  HACKED_SESSIONS,
  HACKED_SHIELD_LAYERS,
} from "@/data/patrol-hacked-account";

export interface HackedAccountSceneData {
  locale: PatrolLocale;
  onComplete?: (correct: boolean) => void;
  onClose?: () => void;
}

type StageId = 1 | 2 | 3 | 4 | 5;

export class HackedAccountScene extends Phaser.Scene {
  private locale: PatrolLocale = "ru";
  private onComplete?: (correct: boolean) => void;
  private onClose?: () => void;

  private stage: StageId = 1;
  private stageRoot?: Phaser.GameObjects.Container;
  private headerRoot?: Phaser.GameObjects.Container;

  // Stage 1: Profile X-Ray state
  private scannedFlagIds: Set<string> = new Set();
  private xrayReticle?: Phaser.GameObjects.Container;

  // Stage 2: Login Trap & QR Hijack state
  private trapIndex = 0;
  private trapSolved = false;
  private tunnelGraphics?: Phaser.GameObjects.Graphics;
  private tunnelPhase = 0;

  // Stage 3: Active Sessions Manager state
  private killedSessionIds: Set<string> = new Set();
  private sessionPulseGraphics?: Phaser.GameObjects.Graphics;
  private sessionPulsePhase = 0;

  // Stage 4: 3 Defense Layers vs Shadow state
  private layerRoundIndex = 0;
  private shadowHp = 100;

  constructor() {
    super("hacked-account");
  }

  init(data: HackedAccountSceneData) {
    this.locale = data.locale ?? "ru";
    this.onComplete = data.onComplete;
    this.onClose = data.onClose;

    this.stage = 1;
    this.scannedFlagIds = new Set();
    this.trapIndex = 0;
    this.trapSolved = false;
    this.killedSessionIds = new Set();
    this.layerRoundIndex = 0;
    this.shadowHp = 100;
  }

  create() {
    const { width, height } = this.scale;

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
    // Всего 12 шагов: 3 (рентген профиля) + 3 (ловушки входа) + 3 (активные сессии) + 3 (рубежи защиты) = 12
    const total = 12;
    if (this.stage === 5) return { completed: total, total };

    const s1 = this.scannedFlagIds.size; // 0..3
    const s2 =
      this.stage > 2
        ? 3
        : this.stage === 2
          ? this.trapIndex + (this.trapSolved ? 1 : 0)
          : 0;
    const s3 = this.stage > 3 ? 3 : this.stage === 3 ? this.killedSessionIds.size : 0;
    const s4 = this.stage === 4 ? this.layerRoundIndex : 0;

    return {
      completed: Math.min(total, s1 + s2 + s3 + s4),
      total,
    };
  }

  private renderHeader() {
    this.headerRoot?.destroy(true);
    this.headerRoot = this.add.container(0, 0);

    const { width } = this.scale;
    const meta = HACKED_ACCOUNT_META[this.locale];
    const { completed, total } = this.getCompletedTasksCount();
    const pct = Math.round((completed / total) * 100);
    const remaining = Math.max(0, total - completed);

    // Верхняя шапка
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x0f1f3a, 0.95);
    headerBg.fillRoundedRect(24, 20, width - 48, 92, 14);
    headerBg.lineStyle(1.5, 0x1e3a5f, 0.9);
    headerBg.strokeRoundedRect(24, 20, width - 48, 92, 14);
    this.headerRoot.add(headerBg);

    const badge = this.add.text(40, 30, meta.categoryBadge, {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "11px",
      fontStyle: "bold",
      color: "#00d9ff",
    });
    const subBadge = this.add.text(40, 47, meta.npcBadge, {
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#f0f6fc",
    });
    this.headerRoot.add([badge, subBadge]);

    // Кнопка закрытия
    const closeBtnBg = this.add
      .rectangle(width - 96, 42, 118, 30, 0x182b49, 0.95)
      .setStrokeStyle(1.5, 0x334155)
      .setInteractive({ useHandCursor: true });
    const closeBtnTxt = this.add
      .text(width - 96, 42, meta.closeLabel, {
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#cbd5e1",
      })
      .setOrigin(0.5);

    closeBtnBg.on("pointerover", () => closeBtnBg.setFillStyle(0x243b61, 1));
    closeBtnBg.on("pointerout", () => closeBtnBg.setFillStyle(0x182b49, 0.95));
    closeBtnBg.on("pointerdown", () => this.closeScene());
    this.headerRoot.add([closeBtnBg, closeBtnTxt]);

    // Прогресс-бар (4 этапа)
    const barX = 40;
    const barY = 74;
    const barW = 360;
    const barH = 10;

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
      barY + 14,
      `${meta.progressLabel}: ${pct}% · ${
        remaining === 0 ? meta.allDoneLabel : `${meta.remainingLabel}: ${remaining}`
      }`,
      {
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontStyle: "bold",
        color: pct === 100 ? "#34d399" : "#94a3b8",
      },
    );
    this.headerRoot.add(progressText);

    // 4 плашки этапов справа от прогресс-бара
    const pillStartX = 420;
    const pillW = 122;
    const pillGap = 8;

    meta.stageNames.forEach((stageName, idx) => {
      const stageNum = (idx + 1) as StageId;
      const isDone = this.stage > stageNum || this.stage === 5;
      const isCurrent = this.stage === stageNum;
      const px = pillStartX + idx * (pillW + pillGap);
      const py = 82;

      const fill = isDone ? 0x064e3b : isCurrent ? 0x0c365a : 0x091326;
      const stroke = isDone ? 0x10b981 : isCurrent ? 0x00d9ff : 0x1e293b;
      const textColor = isDone ? "#6ee7b7" : isCurrent ? "#7dd3fc" : "#64748b";

      const pill = this.add
        .rectangle(px + pillW / 2, py, pillW, 26, fill, 0.95)
        .setStrokeStyle(1.5, stroke);
      const label = this.add
        .text(px + pillW / 2, py, isDone ? `✓ ${stageName}` : stageName, {
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          fontStyle: "bold",
          color: textColor,
        })
        .setOrigin(0.5);

      this.headerRoot?.add([pill, label]);
    });
  }

  private renderCurrentStage() {
    this.stageRoot?.destroy(true);
    this.stageRoot = this.add.container(0, 0);
    this.xrayReticle = undefined;
    this.tunnelGraphics = undefined;
    this.sessionPulseGraphics = undefined;

    this.renderHeader();

    if (this.stage === 1) {
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

  // ============================================================================
  // ЭТАП 1: РЕНТГЕН ПРОФИЛЯ ПРОДАВЦА (ПОИСК 3 УЛИК ВЗЛОМА)
  // ============================================================================
  private renderStage1ProfileXray() {
    if (!this.stageRoot) return;
    const meta = HACKED_ACCOUNT_META[this.locale];

    const title = this.add.text(36, 122, meta.stage1Title, {
      fontFamily: "Inter, sans-serif",
      fontSize: "17px",
      fontStyle: "900",
      color: "#ffffff",
    });
    const subtitle = this.add.text(36, 146, meta.stage1Subtitle, {
      fontFamily: "Inter, sans-serif",
      fontSize: "12.5px",
      color: "#94a3b8",
      wordWrap: { width: 880 },
    });
    this.stageRoot.add([title, subtitle]);

    // Левая панель: Карточка профиля продавца в соцсети/маркетплейсе
    const cardX = 36;
    const cardY = 180;
    const cardW = 435;
    const cardH = 396;

    const cardFrame = this.add.graphics();
    cardFrame.fillStyle(0x071022, 1);
    cardFrame.fillRoundedRect(cardX, cardY, cardW, cardH, 20);
    cardFrame.lineStyle(2.5, 0x38bdf8, 0.75);
    cardFrame.strokeRoundedRect(cardX, cardY, cardW, cardH, 20);
    this.stageRoot.add(cardFrame);

    const profileHeader = this.add
      .text(
        cardX + cardW / 2,
        cardY + 18,
        this.locale === "ro"
          ? "🔍 PROFIL VÂNZĂTOR · MOD RAZE X ACTIV"
          : "🔍 ПРОФИЛЬ ПРОДАВЦА · РЕЖИМ РЕНТГЕНА АКТИВЕН",
        {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "11px",
          fontStyle: "bold",
          color: "#38bdf8",
        },
      )
      .setOrigin(0.5);
    this.stageRoot.add(profileHeader);

    // Правая панель: Отчёт рентген-сканера и список найденных улик
    const rightX = 492;
    const rightY = 180;
    const rightW = 432;
    const rightH = 396;

    const rightBox = this.add.graphics();
    rightBox.fillStyle(0x0c1930, 0.95);
    rightBox.fillRoundedRect(rightX, rightY, rightW, rightH, 18);
    rightBox.lineStyle(1.5, 0x1e3a5f, 0.9);
    rightBox.strokeRoundedRect(rightX, rightY, rightW, rightH, 18);
    this.stageRoot.add(rightBox);

    const scanCounterText = this.add.text(
      rightX + 20,
      rightY + 18,
      `${meta.stage1ScanHint}${this.scannedFlagIds.size}/3)`,
      {
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#00d9ff",
        wordWrap: { width: rightW - 40 },
      },
    );

    const findingBoxBg = this.add.graphics();
    findingBoxBg.fillStyle(0x071124, 0.95);
    findingBoxBg.fillRoundedRect(rightX + 18, rightY + 56, rightW - 36, 130, 12);
    findingBoxBg.lineStyle(1.5, 0x334155, 0.9);
    findingBoxBg.strokeRoundedRect(rightX + 18, rightY + 56, rightW - 36, 130, 12);

    const findingTitleText = this.add.text(
      rightX + 32,
      rightY + 70,
      this.locale === "ro"
        ? "Selectează un element din profilul din stânga..."
        : "Нажми на любой блок профиля слева для рентген-проверки...",
      {
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#f8fafc",
        wordWrap: { width: rightW - 64 },
      },
    );

    const findingDescText = this.add.text(
      rightX + 32,
      rightY + 98,
      this.locale === "ro"
        ? "Razele X îți arată când au fost modificate datele cardului, postările și linkurile de contact."
        : "Рентген покажет скрытую историю изменений профиля: когда менялись карта, комментарии и ссылки.",
      {
        fontFamily: "Inter, sans-serif",
        fontSize: "12.5px",
        color: "#cbd5e1",
        lineSpacing: 3,
        wordWrap: { width: rightW - 64 },
      },
    );
    this.stageRoot.add([scanCounterText, findingBoxBg, findingTitleText, findingDescText]);

    // Список 3 улик
    const flagsListContainer = this.add.container(rightX + 18, rightY + 198);
    this.stageRoot.add(flagsListContainer);

    const updateFlagsChecklist = () => {
      flagsListContainer.removeAll(true);
      const flagSpots = HACKED_PROFILE_SPOTS.filter((s) => s.isFlag);

      flagSpots.forEach((flag, idx) => {
        const found = this.scannedFlagIds.has(flag.id);
        const rowY = idx * 42;
        const rowBg = this.add
          .rectangle(
            (rightW - 36) / 2,
            rowY + 16,
            rightW - 36,
            34,
            found ? 0x064e3b : 0x091326,
            0.9,
          )
          .setStrokeStyle(1, found ? 0x10b981 : 0x1e293b);

        const rowTxt = this.add.text(
          12,
          rowY + 8,
          found
            ? `✓ ${flag.findingTitle[this.locale]}`
            : `${idx + 1}. ${
                this.locale === "ro"
                  ? "Indiciu ascuns (scanează profilul)"
                  : "Скрытая улика взлома (просвети профиль)"
              }`,
          {
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontStyle: "bold",
            color: found ? "#6ee7b7" : "#64748b",
          },
        );
        flagsListContainer.add([rowBg, rowTxt]);
      });

      if (this.scannedFlagIds.size >= 3) {
        const nextBtn = this.add
          .rectangle((rightW - 36) / 2, 152, rightW - 36, 44, 0x00d9ff, 1)
          .setStrokeStyle(2, 0xbae6fd)
          .setInteractive({ useHandCursor: true });

        const nextTxt = this.add
          .text((rightW - 36) / 2, 152, meta.nextStageBtn, {
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontStyle: "900",
            color: "#041022",
          })
          .setOrigin(0.5);

        nextBtn.on("pointerover", () => nextBtn.setFillStyle(0x38bdf8, 1));
        nextBtn.on("pointerout", () => nextBtn.setFillStyle(0x00d9ff, 1));
        nextBtn.on("pointerdown", () => {
          this.stage = 2;
          this.renderCurrentStage();
        });

        flagsListContainer.add([nextBtn, nextTxt]);
      }
    };

    updateFlagsChecklist();

    // Рендерим 5 интерактивных зон профиля продавца
    HACKED_PROFILE_SPOTS.forEach((spot, index) => {
      const spotY = cardY + 58 + index * 64;
      const spotW = cardW - 32;
      const spotH = 54;
      const centerX = cardX + cardW / 2;

      const isAlreadyFound = this.scannedFlagIds.has(spot.id);

      const spotBg = this.add
        .rectangle(
          centerX,
          spotY,
          spotW,
          spotH,
          isAlreadyFound ? 0x3b0a1e : 0x101f38,
          0.95,
        )
        .setStrokeStyle(1.5, isAlreadyFound ? 0xf43f5e : 0x264066)
        .setInteractive({ useHandCursor: true });

      const labelTxt = this.add.text(cardX + 28, spotY - 17, spot.label[this.locale], {
        fontFamily: "Inter, sans-serif",
        fontSize: "12.5px",
        fontStyle: "bold",
        color: "#f8fafc",
        wordWrap: { width: spotW - 88 },
      });

      const subTxt = this.add.text(cardX + 28, spotY + 4, spot.sublabel[this.locale], {
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        color: "#94a3b8",
        wordWrap: { width: spotW - 88 },
      });

      const statusTag = this.add
        .text(
          cardX + cardW - 56,
          spotY,
          isAlreadyFound ? "⚠️ УЛИКА" : "РЕНТГЕН",
          {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "10px",
            fontStyle: "bold",
            color: isAlreadyFound ? "#fda4af" : "#38bdf8",
          },
        )
        .setOrigin(0.5);

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
          statusTag
            .setText(this.locale === "ro" ? "⚠️ FALS" : "⚠️ УЛИКА")
            .setColor("#fda4af");

          findingTitleText
            .setText(spot.findingTitle[this.locale])
            .setColor("#fda4af");
          findingDescText.setText(spot.findingDesc[this.locale]);

          scanCounterText.setText(
            `${meta.stage1ScanHint}${this.scannedFlagIds.size}/3)`,
          );
          updateFlagsChecklist();
          this.renderHeader();
        } else {
          spotBg.setFillStyle(0x0b2e28, 0.95);
          spotBg.setStrokeStyle(1.5, 0x10b981);
          statusTag.setText("✓ OK").setColor("#6ee7b7");

          findingTitleText
            .setText(spot.findingTitle[this.locale])
            .setColor("#6ee7b7");
          findingDescText.setText(spot.findingDesc[this.locale]);
        }
      });

      this.stageRoot?.add([spotBg, labelTxt, subTxt, statusTag]);
    });

    // Прицел рентген-сканера
    const reticle = this.add.container(cardX + cardW / 2, cardY + cardH / 2);
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
        const clampedX = Phaser.Math.Clamp(pointer.x, cardX + 28, cardX + cardW - 28);
        const clampedY = Phaser.Math.Clamp(pointer.y, cardY + 28, cardY + cardH - 28);
        this.xrayReticle.setPosition(clampedX, clampedY);
      }
    });
  }

  // ============================================================================
  // ЭТАП 2: ЛОВУШКА ФЕЙКОВОГО ВХОДА И QR-КОДА (3 КИБЕР-БАРЬЕРА)
  // ============================================================================
  private renderStage2LoginTraps() {
    if (!this.stageRoot) return;
    const meta = HACKED_ACCOUNT_META[this.locale];
    const currentTrap = HACKED_LOGIN_TRAPS[this.trapIndex];

    const title = this.add.text(36, 122, meta.stage2Title, {
      fontFamily: "Inter, sans-serif",
      fontSize: "17px",
      fontStyle: "900",
      color: "#ffffff",
    });
    const subtitle = this.add.text(36, 146, meta.stage2Subtitle, {
      fontFamily: "Inter, sans-serif",
      fontSize: "12.5px",
      color: "#94a3b8",
      wordWrap: { width: 880 },
    });
    this.stageRoot.add([title, subtitle]);

    // Центральный экран туннеля перехвата данных
    const scopeX = 36;
    const scopeY = 182;
    const scopeW = 888;
    const scopeH = 198;

    const scopeBg = this.add.graphics();
    scopeBg.fillStyle(0x050c1a, 0.98);
    scopeBg.fillRoundedRect(scopeX, scopeY, scopeW, scopeH, 16);
    scopeBg.lineStyle(2, this.trapSolved ? 0x10b981 : 0xf43f5e, 0.85);
    scopeBg.strokeRoundedRect(scopeX, scopeY, scopeW, scopeH, 16);
    this.stageRoot.add(scopeBg);

    this.tunnelGraphics = this.add.graphics();
    this.stageRoot.add(this.tunnelGraphics);
    this.drawDataTunnel();

    const trapCounter = this.add.text(
      scopeX + 20,
      scopeY + 14,
      this.locale === "ro"
        ? `CAPCANA ${this.trapIndex + 1} DIN ${HACKED_LOGIN_TRAPS.length} · ${currentTrap.trapMechanism.ro}`
        : `ЛОВУШКА ${this.trapIndex + 1} ИЗ ${HACKED_LOGIN_TRAPS.length} · ${currentTrap.trapMechanism.ru}`,
      {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "11.5px",
        fontStyle: "bold",
        color: this.trapSolved ? "#34d399" : "#fda4af",
      },
    );

    const quoteTxt = this.add
      .text(scopeX + scopeW / 2, scopeY + 66, currentTrap.attackerMessage[this.locale], {
        fontFamily: "Inter, sans-serif",
        fontSize: "14.5px",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: scopeW - 60 },
      })
      .setOrigin(0.5);

    this.stageRoot.add([trapCounter, quoteTxt]);

    // Поле обратной связи
    const feedbackText = this.add
      .text(
        scopeX + scopeW / 2,
        scopeY + 168,
        this.trapSolved
          ? currentTrap.successFeedback[this.locale]
          : this.locale === "ro"
            ? "Alege bariera cibernetică potrivită mai jos pentru a opri furtul contului:"
            : "Выбери подходящий кибер-барьер ниже, чтобы заблокировать кражу доступа:",
        {
          fontFamily: "Inter, sans-serif",
          fontSize: "12.5px",
          fontStyle: "bold",
          color: this.trapSolved ? "#6ee7b7" : "#94a3b8",
          align: "center",
          wordWrap: { width: scopeW - 50 },
        },
      )
      .setOrigin(0.5);
    this.stageRoot.add(feedbackText);

    // 3 кнопки кибер-барьеров
    const btnY = 428;
    const btnW = 284;
    const btnH = 74;
    const btnGap = 18;

    meta.stage2Blockers.forEach((blockerLabel, idx) => {
      const bx = 36 + idx * (btnW + btnGap) + btnW / 2;
      const isCorrectChoice = idx === currentTrap.correctBlockerIndex;

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

      const btnTxt = this.add
        .text(bx, btnY, blockerLabel, {
          fontFamily: "Inter, sans-serif",
          fontSize: "12.5px",
          fontStyle: "bold",
          color: "#f8fafc",
          align: "center",
          wordWrap: { width: btnW - 24 },
        })
        .setOrigin(0.5);

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
          btnBg.setFillStyle(0x4c0519, 0.95);
          btnBg.setStrokeStyle(2, 0xf43f5e);
          feedbackText
            .setText(currentTrap.wrongFeedback[this.locale])
            .setColor("#fda4af");
          this.cameras.main.shake(120, 0.004);
        }
      });

      this.stageRoot?.add([btnBg, btnTxt]);
    });

    if (this.trapSolved) {
      const isLastTrap = this.trapIndex >= HACKED_LOGIN_TRAPS.length - 1;
      const nextBtn = this.add
        .rectangle(
          480,
          534,
          440,
          44,
          0x00d9ff,
          1,
        )
        .setStrokeStyle(2, 0xbae6fd)
        .setInteractive({ useHandCursor: true });

      const nextTxt = this.add
        .text(
          480,
          534,
          isLastTrap
            ? meta.nextStageBtn
            : this.locale === "ro"
              ? "Următoarea capcană de login →"
              : "Следующая ловушка входа →",
          {
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontStyle: "900",
            color: "#041022",
          },
        )
        .setOrigin(0.5);

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

    const startX = 110;
    const endX = 850;
    const midX = 480;
    const y = 304;

    const lineColor = this.trapSolved ? 0x10b981 : 0xf43f5e;
    this.tunnelGraphics.lineStyle(3, lineColor, 0.45);
    this.tunnelGraphics.lineBetween(startX, y, this.trapSolved ? midX : endX, y);

    // Барьер посередине
    if (this.trapSolved) {
      this.tunnelGraphics.fillStyle(0x10b981, 0.9);
      this.tunnelGraphics.fillRoundedRect(midX - 8, y - 22, 16, 44, 6);
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
    const meta = HACKED_ACCOUNT_META[this.locale];

    const title = this.add.text(36, 122, meta.stage3Title, {
      fontFamily: "Inter, sans-serif",
      fontSize: "17px",
      fontStyle: "900",
      color: "#ffffff",
    });
    const subtitle = this.add.text(36, 146, meta.stage3Subtitle, {
      fontFamily: "Inter, sans-serif",
      fontSize: "12.5px",
      color: "#94a3b8",
      wordWrap: { width: 880 },
    });
    this.stageRoot.add([title, subtitle]);

    this.sessionPulseGraphics = this.add.graphics();
    this.stageRoot.add(this.sessionPulseGraphics);
    this.drawSessionActivityWave();

    const statusToast = this.add
      .text(
        480,
        504,
        this.killedSessionIds.size >= 3
          ? this.locale === "ro"
            ? "Toate cele 3 sesiuni ale hackerului au fost închise! Accesul străin este blocat."
            : "Все 3 чужие сессии отключены! Хакер выброшен из аккаунта продавца."
          : this.locale === "ro"
            ? `Sesiuni străine închise: ${this.killedSessionIds.size}/3`
            : `Отключено хакерских сессий: ${this.killedSessionIds.size}/3`,
        {
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontStyle: "bold",
          color: this.killedSessionIds.size >= 3 ? "#34d399" : "#38bdf8",
        },
      )
      .setOrigin(0.5);
    this.stageRoot.add(statusToast);

    // 4 карточки устройств (2x2 сетка)
    const startX = 36;
    const startY = 182;
    const cardW = 434;
    const cardH = 148;
    const gapX = 20;
    const gapY = 14;

    HACKED_SESSIONS.forEach((sess, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = startX + col * (cardW + gapX);
      const cy = startY + row * (cardH + gapY);

      const isKilled = this.killedSessionIds.has(sess.id);
      const isOwner = !sess.isHacker;

      const cardBg = this.add.graphics();
      cardBg.fillStyle(
        isOwner ? 0x092230 : isKilled ? 0x062e24 : 0x260b18,
        0.95,
      );
      cardBg.fillRoundedRect(cx, cy, cardW, cardH, 14);
      cardBg.lineStyle(
        2,
        isOwner ? 0x00d9ff : isKilled ? 0x10b981 : 0xf43f5e,
        0.9,
      );
      cardBg.strokeRoundedRect(cx, cy, cardW, cardH, 14);

      const devTitle = this.add.text(cx + 16, cy + 12, sess.deviceTitle[this.locale], {
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontStyle: "900",
        color: "#ffffff",
        wordWrap: { width: cardW - 32 },
      });

      const locMeta = this.add.text(cx + 16, cy + 34, sess.locationMeta[this.locale], {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "10.5px",
        color: isOwner ? "#7dd3fc" : isKilled ? "#6ee7b7" : "#fda4af",
        wordWrap: { width: cardW - 32 },
      });

      const activityTxt = this.add.text(
        cx + 16,
        cy + 56,
        isKilled ? `✓ ${sess.explanation[this.locale]}` : sess.liveActivity[this.locale],
        {
          fontFamily: "Inter, sans-serif",
          fontSize: "11.5px",
          fontStyle: "bold",
          color: isKilled ? "#a7f3d0" : "#e2e8f0",
          wordWrap: { width: cardW - 32 },
        },
      );

      const btnFill = isOwner ? 0x0f3156 : isKilled ? 0x065f46 : 0xe11d48;
      const btnStroke = isOwner ? 0x38bdf8 : isKilled ? 0x34d399 : 0xfda4af;
      const btnLabel = isOwner
        ? meta.stage3OwnerBadge
        : isKilled
          ? meta.stage3KilledBadge
          : meta.stage3KillBtn;

      const actionBtn = this.add
        .rectangle(cx + cardW / 2, cy + 120, cardW - 32, 34, btnFill, 1)
        .setStrokeStyle(1.5, btnStroke)
        .setInteractive({ useHandCursor: !isKilled });

      const actionTxt = this.add
        .text(cx + cardW / 2, cy + 120, btnLabel, {
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          fontStyle: "900",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      actionBtn.on("pointerdown", () => {
        if (isOwner) {
          statusToast
            .setText(sess.explanation[this.locale])
            .setColor("#7dd3fc");
          return;
        }
        if (!this.killedSessionIds.has(sess.id)) {
          this.killedSessionIds.add(sess.id);
          this.renderCurrentStage();
        }
      });

      this.stageRoot?.add([
        cardBg,
        devTitle,
        locMeta,
        activityTxt,
        actionBtn,
        actionTxt,
      ]);
    });

    if (this.killedSessionIds.size >= 3) {
      const nextBtn = this.add
        .rectangle(480, 544, 430, 42, 0x00d9ff, 1)
        .setStrokeStyle(2, 0xbae6fd)
        .setInteractive({ useHandCursor: true });

      const nextTxt = this.add
        .text(480, 544, meta.nextStageBtn, {
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontStyle: "900",
          color: "#041022",
        })
        .setOrigin(0.5);

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

    const allClean = this.killedSessionIds.size >= 3;
    const color = allClean ? 0x10b981 : 0xf43f5e;
    this.sessionPulseGraphics.lineStyle(2, color, 0.35);
    this.sessionPulseGraphics.beginPath();

    for (let x = 40; x <= 920; x += 8) {
      const amp = allClean ? 3 : 10;
      const y = 504 + Math.sin(x * 0.03 + this.sessionPulsePhase) * amp;
      if (x === 40) this.sessionPulseGraphics.moveTo(x, y);
      else this.sessionPulseGraphics.lineTo(x, y);
    }
    this.sessionPulseGraphics.strokePath();
  }

  // ============================================================================
  // ЭТАП 4: 3 РУБЕЖА ЗАЩИТЫ ПРОТИВ ТЕНИ (ПАРОЛЬ + 2FA + ОПОВЕЩЕНИЕ)
  // ============================================================================
  private renderStage4DefenseShields() {
    if (!this.stageRoot) return;
    const meta = HACKED_ACCOUNT_META[this.locale];
    const round = HACKED_SHIELD_LAYERS[this.layerRoundIndex];

    const title = this.add.text(36, 122, meta.stage4Title, {
      fontFamily: "Inter, sans-serif",
      fontSize: "17px",
      fontStyle: "900",
      color: "#ffffff",
    });
    const subtitle = this.add.text(36, 146, meta.stage4Subtitle, {
      fontFamily: "Inter, sans-serif",
      fontSize: "12.5px",
      color: "#94a3b8",
      wordWrap: { width: 880 },
    });
    this.stageRoot.add([title, subtitle]);

    // Панель HP Тени и 3 рубежей защиты
    const bossX = 36;
    const bossY = 182;
    const bossW = 888;
    const bossH = 114;

    const bossBg = this.add.graphics();
    bossBg.fillStyle(0x1f0918, 0.95);
    bossBg.fillRoundedRect(bossX, bossY, bossW, bossH, 16);
    bossBg.lineStyle(2, 0xf43f5e, 0.85);
    bossBg.strokeRoundedRect(bossX, bossY, bossW, bossH, 16);
    this.stageRoot.add(bossBg);

    const bossName = this.add.text(
      bossX + 22,
      bossY + 14,
      `${round.layerBadge[this.locale]} · ${
        this.locale === "ro"
          ? `Accesul Umbrei la cont: ${this.shadowHp}% HP`
          : `Доступ Тени к аккаунту: ${this.shadowHp}% HP`
      }`,
      {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "12px",
        fontStyle: "bold",
        color: "#fda4af",
      },
    );

    // Полоска HP Тени
    const hpTrack = this.add.graphics();
    hpTrack.fillStyle(0x090d16, 1);
    hpTrack.fillRoundedRect(bossX + 22, bossY + 38, 380, 12, 6);
    if (this.shadowHp > 0) {
      hpTrack.fillStyle(0xf43f5e, 1);
      hpTrack.fillRoundedRect(
        bossX + 22,
        bossY + 38,
        Math.max(12, (380 * this.shadowHp) / 100),
        12,
        6,
      );
    }

    const attackTxt = this.add.text(
      bossX + 22,
      bossY + 62,
      round.shadowThreat[this.locale],
      {
        fontFamily: "Inter, sans-serif",
        fontSize: "13.5px",
        fontStyle: "bold",
        color: "#ffffff",
        wordWrap: { width: bossW - 44 },
      },
    );
    this.stageRoot.add([bossName, hpTrack, attackTxt]);

    // Поле фидбека раунда
    const duelFeedback = this.add
      .text(
        480,
        316,
        this.locale === "ro"
          ? `Pasul ${this.layerRoundIndex + 1}/3 · Alege măsura de securitate corectă:`
          : `Рубеж ${this.layerRoundIndex + 1}/3 · Выбери правильную меру защиты аккаунта:`,
        {
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontStyle: "bold",
          color: "#38bdf8",
        },
      )
      .setOrigin(0.5);
    this.stageRoot.add(duelFeedback);

    // 3 карты рубежей защиты
    const cardW = 282;
    const cardH = 212;
    const gap = 21;

    round.cards.forEach((card, idx) => {
      const cx = 36 + idx * (cardW + gap);
      const cy = 338;

      const cardRect = this.add
        .rectangle(cx + cardW / 2, cy + cardH / 2, cardW, cardH, 0x0d1f3a, 0.96)
        .setStrokeStyle(2, 0x00d9ff)
        .setInteractive({ useHandCursor: true });

      const cTitle = this.add.text(cx + 16, cy + 16, card.title[this.locale], {
        fontFamily: "Inter, sans-serif",
        fontSize: "13.5px",
        fontStyle: "900",
        color: "#7dd3fc",
        wordWrap: { width: cardW - 32 },
      });

      const cDesc = this.add.text(cx + 16, cy + 66, card.desc[this.locale], {
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        color: "#e2e8f0",
        lineSpacing: 3,
        wordWrap: { width: cardW - 32 },
      });

      const playBadge = this.add
        .rectangle(cx + cardW / 2, cy + cardH - 26, cardW - 32, 30, 0x16325b, 1)
        .setStrokeStyle(1, 0x38bdf8);

      const playTxt = this.add
        .text(
          cx + cardW / 2,
          cy + cardH - 26,
          this.locale === "ro" ? "ACTIVEAZĂ SCUTUL ⚡" : "УСТАНОВИТЬ РУБЕЖ ⚡",
          {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "11px",
            fontStyle: "bold",
            color: "#bae6fd",
          },
        )
        .setOrigin(0.5);

      cardRect.on("pointerover", () => cardRect.setFillStyle(0x163059, 1));
      cardRect.on("pointerout", () => cardRect.setFillStyle(0x0d1f3a, 0.96));

      cardRect.on("pointerdown", () => {
        if (card.correct) {
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
    const meta = HACKED_ACCOUNT_META[this.locale];

    const boxX = 56;
    const boxY = 136;
    const boxW = 848;
    const boxH = 432;

    const bg = this.add.graphics();
    bg.fillStyle(0x071f1e, 0.96);
    bg.fillRoundedRect(boxX, boxY, boxW, boxH, 20);
    bg.lineStyle(2.5, 0x10b981, 0.95);
    bg.strokeRoundedRect(boxX, boxY, boxW, boxH, 20);
    this.stageRoot.add(bg);

    const title = this.add
      .text(480, boxY + 38, `🛡️ ${meta.victoryTitle}`, {
        fontFamily: "Inter, sans-serif",
        fontSize: "21px",
        fontStyle: "900",
        color: "#6ee7b7",
        align: "center",
      })
      .setOrigin(0.5);

    const sub = this.add
      .text(480, boxY + 78, meta.victorySubtitle, {
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        color: "#cbd5e1",
        align: "center",
        wordWrap: { width: boxW - 80 },
      })
      .setOrigin(0.5);

    this.stageRoot.add([title, sub]);

    meta.victoryRules.forEach((rule, idx) => {
      const ry = boxY + 122 + idx * 54;
      const rBg = this.add
        .rectangle(480, ry + 18, boxW - 72, 44, 0x0a2e2c, 0.9)
        .setStrokeStyle(1, 0x10b981);

      const rTxt = this.add.text(boxX + 52, ry + 8, `✓  ${rule}`, {
        fontFamily: "Inter, sans-serif",
        fontSize: "12.5px",
        fontStyle: "bold",
        color: "#f0fdf4",
        wordWrap: { width: boxW - 110 },
      });

      this.stageRoot?.add([rBg, rTxt]);
    });

    const finishBtn = this.add
      .rectangle(480, boxY + boxH - 44, 460, 48, 0x10b981, 1)
      .setStrokeStyle(2, 0xa7f3d0)
      .setInteractive({ useHandCursor: true });

    const finishTxt = this.add
      .text(480, boxY + boxH - 44, meta.finishBtn, {
        fontFamily: "Inter, sans-serif",
        fontSize: "15px",
        fontStyle: "900",
        color: "#022c22",
      })
      .setOrigin(0.5);

    finishBtn.on("pointerover", () => finishBtn.setFillStyle(0x34d399, 1));
    finishBtn.on("pointerout", () => finishBtn.setFillStyle(0x10b981, 1));
    finishBtn.on("pointerdown", () => {
      const complete = this.onComplete;
      this.onComplete = undefined;
      this.scene.stop();
      complete?.(true);
    });

    this.stageRoot.add([finishBtn, finishTxt]);
  }

  private closeScene() {
    const close = this.onClose;
    this.onClose = undefined;
    this.scene.stop();
    close?.();
  }
}
