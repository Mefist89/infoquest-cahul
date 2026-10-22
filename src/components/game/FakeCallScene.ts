import Phaser from "phaser";

import type { PatrolLocale } from "@/data/patrol";
import {
  FAKE_CALL_DUEL_ROUNDS,
  FAKE_CALL_SCANNER_SPOTS,
  FAKE_CALL_STAGES_META,
  FAKE_CALL_SWITCH_NODES,
  FAKE_CALL_WAVES,
} from "@/data/patrol-fake-call";

export interface FakeCallSceneData {
  locale: PatrolLocale;
  onComplete?: (correct: boolean) => void;
  onClose?: () => void;
}

type StageId = 1 | 2 | 3 | 4 | 5;

export class FakeCallScene extends Phaser.Scene {
  private locale: PatrolLocale = "ru";
  private onComplete?: (correct: boolean) => void;
  private onClose?: () => void;

  private stage: StageId = 1;
  private stageRoot?: Phaser.GameObjects.Container;
  private headerRoot?: Phaser.GameObjects.Container;

  // Stage 1: Caller ID Scanner state
  private scannedFlagIds: Set<string> = new Set();
  private scannerReticle?: Phaser.GameObjects.Container;

  // Stage 2: Wave Interception state
  private waveIndex = 0;
  private waveSolved = false;
  private waveGraphics?: Phaser.GameObjects.Graphics;
  private wavePhase = 0;

  // Stage 3: Circuit Switchboard state
  private switchedNodeIds: Set<string> = new Set();
  private wireGraphics?: Phaser.GameObjects.Graphics;
  private wirePulseProgress = 0;

  // Stage 4: Duel vs Shadow state
  private duelRoundIndex = 0;
  private shadowHp = 100;

  constructor() {
    super("fake-call");
  }

  init(data: FakeCallSceneData) {
    this.locale = data.locale ?? "ru";
    this.onComplete = data.onComplete;
    this.onClose = data.onClose;

    this.stage = 1;
    this.scannedFlagIds = new Set();
    this.waveIndex = 0;
    this.waveSolved = false;
    this.switchedNodeIds = new Set();
    this.duelRoundIndex = 0;
    this.shadowHp = 100;
  }

  create() {
    const { width, height } = this.scale;

    // Полноэкранный тёмный фон лаборатории киберзащиты
    this.add.rectangle(0, 0, width, height, 0x040916, 0.96).setOrigin(0);

    // Декоративная сетка на фоне Phaser
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
    // Анимация звуковой осциллограммы на Этапе 2
    if (this.stage === 2 && this.waveGraphics && this.waveGraphics.scene) {
      this.wavePhase += delta * 0.008;
      this.drawOscilloscopeWave();
    }

    // Анимация импульсов по проводам коммутатора на Этапе 3
    if (this.stage === 3 && this.wireGraphics && this.wireGraphics.scene) {
      this.wirePulseProgress = (this.wirePulseProgress + delta * 0.0007) % 1;
      this.drawCircuitWires();
    }
  }

  private getCompletedTasksCount(): { completed: number; total: number } {
    // Всего 11 шагов: 3 (сканер) + 3 (волны) + 3 (узлы коммутатора) + 2 (дуэль) = 11
    const total = 11;
    if (this.stage === 5) return { completed: total, total };

    const s1 = this.scannedFlagIds.size; // 0..3
    const s2 =
      this.stage > 2
        ? 3
        : this.stage === 2
          ? this.waveIndex + (this.waveSolved ? 1 : 0)
          : 0;
    const s3 = this.stage > 3 ? 3 : this.stage === 3 ? this.switchedNodeIds.size : 0;
    const s4 =
      this.stage === 4
        ? this.duelRoundIndex + (this.shadowHp <= 0 ? 1 : 0)
        : 0;

    return { completed: Math.min(total, s1 + s2 + s3 + s4), total };
  }

  private renderHeader() {
    this.headerRoot?.destroy(true);
    const { width } = this.scale;
    const meta = FAKE_CALL_STAGES_META[this.locale];
    const { completed, total } = this.getCompletedTasksCount();
    const remaining = Math.max(0, total - completed);
    const pct = Math.round((completed / total) * 100);

    const root = this.add.container(0, 0);
    this.headerRoot = root;

    // Фон шапки
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x060d1f, 0.95);
    headerBg.fillRoundedRect(14, 12, width - 28, 92, { tl: 18, tr: 18, bl: 0, br: 0 });
    headerBg.lineStyle(1, 0x00d9ff, 0.25);
    headerBg.lineBetween(14, 104, width - 14, 104);
    root.add(headerBg);

    // Категория и персонаж
    const badgeText = this.add.text(28, 20, meta.categoryBadge, {
      fontSize: "12px",
      fontStyle: "bold",
      color: "#00d9ff",
    });
    const subText = this.add.text(28, 37, meta.npcBadge, {
      fontSize: "12px",
      fontStyle: "bold",
      color: "#ffd166",
    });
    root.add([badgeText, subText]);

    // Счётчик оставшихся задач
    const remainLabel =
      remaining === 0 ? meta.allDoneLabel : `${meta.remainingLabel}: ${remaining} · ${pct}%`;
    const remainBox = this.add
      .text(width - 145, 28, remainLabel, {
        fontSize: "12px",
        fontStyle: "bold",
        color: remaining === 0 ? "#34d399" : "#e2e8f0",
        backgroundColor: "#112240",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 0.5);
    root.add(remainBox);

    // Кнопка закрытия
    const closeBg = this.add
      .rectangle(width - 80, 28, 110, 28, 0x162847, 0.95)
      .setStrokeStyle(1.5, 0x00d9ff, 0.5)
      .setInteractive({ useHandCursor: true });
    const closeTxt = this.add
      .text(width - 80, 28, meta.closeLabel, {
        fontSize: "11px",
        fontStyle: "bold",
        color: "#00d9ff",
      })
      .setOrigin(0.5);
    closeBg.on("pointerover", () => closeBg.setFillStyle(0x00d9ff, 0.25));
    closeBg.on("pointerout", () => closeBg.setFillStyle(0x162847, 0.95));
    closeBg.on("pointerdown", () => this.closeScene());
    root.add([closeBg, closeTxt]);

    // Полоса прогресса (0..100%)
    const barX = 28;
    const barY = 60;
    const barW = width - 56;
    const barGraphics = this.add.graphics();
    barGraphics.fillStyle(0x1e293b, 1);
    barGraphics.fillRoundedRect(barX, barY, barW, 8, 4);
    if (pct > 0) {
      barGraphics.fillStyle(pct >= 100 ? 0x34d399 : 0x00d9ff, 1);
      barGraphics.fillRoundedRect(barX, barY, Math.max(12, (barW * pct) / 100), 8, 4);
    }
    root.add(barGraphics);

    // 4 плашки этапов
    const pillGap = 8;
    const pillW = (barW - pillGap * 3) / 4;
    meta.stageNames.forEach((stageName, idx) => {
      const stageNum = (idx + 1) as 1 | 2 | 3 | 4;
      const isDone = this.stage > stageNum || this.stage === 5;
      const isActive = this.stage === stageNum;
      const px = barX + idx * (pillW + pillGap);
      const py = 74;

      const pill = this.add.graphics();
      pill.fillStyle(isActive ? 0x00d9ff : isDone ? 0x064e3b : 0x0f172a, isActive ? 0.22 : 0.85);
      pill.fillRoundedRect(px, py, pillW, 24, 6);
      pill.lineStyle(1.5, isActive ? 0x00d9ff : isDone ? 0x34d399 : 0x334155, 0.9);
      pill.strokeRoundedRect(px, py, pillW, 24, 6);

      const label = this.add
        .text(
          px + pillW / 2,
          py + 12,
          isDone ? `${stageName} ✓` : stageName,
          {
            fontSize: "11px",
            fontStyle: "bold",
            color: isActive ? "#ffffff" : isDone ? "#34d399" : "#94a3b8",
          },
        )
        .setOrigin(0.5);

      root.add([pill, label]);
    });
  }

  private renderCurrentStage() {
    this.stageRoot?.destroy(true);
    this.scannerReticle = undefined;
    this.waveGraphics = undefined;
    this.wireGraphics = undefined;

    this.stageRoot = this.add.container(0, 0);
    this.renderHeader();

    if (this.stage === 1) {
      this.buildStage1Scanner(this.stageRoot);
    } else if (this.stage === 2) {
      this.buildStage2WaveDefense(this.stageRoot);
    } else if (this.stage === 3) {
      this.buildStage3Switchboard(this.stageRoot);
    } else if (this.stage === 4) {
      this.buildStage4Duel(this.stageRoot);
    } else {
      this.buildStage5Victory(this.stageRoot);
    }
  }

  // =========================================================================
  // ЭТАП 1: Сканер подмены номера (Caller ID Инспектор)
  // =========================================================================
  private buildStage1Scanner(root: Phaser.GameObjects.Container) {
    const { width, height } = this.scale;
    const meta = FAKE_CALL_STAGES_META[this.locale];

    const title = this.add.text(28, 114, meta.stage1Title, {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#ffffff",
    });
    const subtitle = this.add.text(28, 138, meta.stage1Subtitle, {
      fontSize: "13px",
      color: "#cbd5e1",
      wordWrap: { width: width - 56 },
    });
    root.add([title, subtitle]);

    // Корпус смартфона слева (x: 34..430, y: 170..565)
    const phoneX = 34;
    const phoneY = 170;
    const phoneW = 396;
    const phoneH = height - 194;

    const phoneBg = this.add.graphics();
    phoneBg.fillStyle(0x060d1f, 0.98);
    phoneBg.fillRoundedRect(phoneX, phoneY, phoneW, phoneH, 22);
    phoneBg.lineStyle(2, 0x00d9ff, 0.55);
    phoneBg.strokeRoundedRect(phoneX, phoneY, phoneW, phoneH, 22);
    root.add(phoneBg);

    const callHeader = this.add
      .text(
        phoneX + phoneW / 2,
        phoneY + 22,
        this.locale === "ro" ? "APEL DE INTRARE · VERIFICARE" : "ВХОДЯЩИЙ ВЫЗОВ · ПРОВЕРКА СКАНЕРОМ",
        {
          fontSize: "11px",
          fontStyle: "bold",
          color: "#00d9ff",
        },
      )
      .setOrigin(0.5);
    root.add(callHeader);

    // Правая панель отчёта сканера (x: 446..width-28)
    const reportX = 446;
    const reportW = width - reportX - 28;
    const reportBg = this.add.graphics();
    reportBg.fillStyle(0x112240, 0.78);
    reportBg.fillRoundedRect(reportX, phoneY, reportW, phoneH, 18);
    reportBg.lineStyle(1.5, 0x00d9ff, 0.35);
    reportBg.strokeRoundedRect(reportX, phoneY, reportW, phoneH, 18);
    root.add(reportBg);

    const activeFindingTitle = this.add.text(
      reportX + 18,
      phoneY + 18,
      `${meta.stage1ScanHint}${this.scannedFlagIds.size}/3)`,
      {
        fontSize: "15px",
        fontStyle: "bold",
        color: "#ffd166",
        wordWrap: { width: reportW - 36 },
      },
    );
    const activeFindingDesc = this.add.text(
      reportX + 18,
      phoneY + 46,
      this.locale === "ro"
        ? "Selectează o zonă de pe ecranul telefonului din stânga pentru a vedea rezultatul scanării."
        : "Нажми прицелом сканера на любую зону экрана телефона слева, чтобы просветить скрытые данные вызова.",
      {
        fontSize: "13px",
        color: "#e2e8f0",
        wordWrap: { width: reportW - 36 },
        lineSpacing: 4,
      },
    );
    root.add([activeFindingTitle, activeFindingDesc]);

    // Карточки 3 улик в правой панели
    const flagsOnly = FAKE_CALL_SCANNER_SPOTS.filter((s) => s.isFlag);
    const updateRightChecklist = () => {
      // Перерисовываем статус и кнопку перехода
      const allFound = this.scannedFlagIds.size >= 3;
      nextBtnContainer.setVisible(allFound);
    };

    const checklistContainers: Phaser.GameObjects.Container[] = [];
    const rebuildChecklist = () => {
      checklistContainers.forEach((c) => c.destroy(true));
      checklistContainers.length = 0;

      flagsOnly.forEach((flagSpot, idx) => {
        const found = this.scannedFlagIds.has(flagSpot.id);
        const cy = phoneY + 115 + idx * 72;
        const c = this.add.container(reportX + 18, cy);

        const box = this.add.graphics();
        box.fillStyle(found ? 0x064e3b : 0x0a1528, 0.9);
        box.fillRoundedRect(0, 0, reportW - 36, 62, 12);
        box.lineStyle(1.5, found ? 0x34d399 : 0x334155, 0.9);
        box.strokeRoundedRect(0, 0, reportW - 36, 62, 12);

        const t1 = this.add.text(
          12,
          10,
          found
            ? `✓ ${flagSpot.findingTitle[this.locale]}`
            : this.locale === "ro"
              ? `○ Indiciul #${idx + 1} (nescanat)`
              : `○ Улика №${idx + 1} (ещё не просвечена сканером)`,
          {
            fontSize: "13px",
            fontStyle: "bold",
            color: found ? "#34d399" : "#94a3b8",
          },
        );
        const t2 = this.add.text(
          12,
          30,
          found
            ? flagSpot.findingDesc[this.locale]
            : this.locale === "ro"
              ? "Treci cu scanerul peste zonele telefonului"
              : "Просвети зоны смартфона слева",
          {
            fontSize: "11px",
            color: found ? "#d1fae5" : "#64748b",
            wordWrap: { width: reportW - 60 },
          },
        );

        c.add([box, t1, t2]);
        root.add(c);
        checklistContainers.push(c);
      });
    };

    // Кнопка перехода к Этапу 2
    const nextBtnContainer = this.add.container(reportX + reportW / 2, phoneY + phoneH - 34);
    const nextBtnRect = this.add
      .rectangle(0, 0, reportW - 36, 44, 0x00d9ff, 1)
      .setInteractive({ useHandCursor: true });
    const nextBtnText = this.add
      .text(0, 0, meta.nextStageBtn, {
        fontSize: "14px",
        fontStyle: "bold",
        color: "#040916",
      })
      .setOrigin(0.5);
    nextBtnRect.on("pointerover", () => nextBtnRect.setFillStyle(0x67e8f9, 1));
    nextBtnRect.on("pointerout", () => nextBtnRect.setFillStyle(0x00d9ff, 1));
    nextBtnRect.on("pointerdown", () => {
      this.stage = 2;
      this.renderCurrentStage();
    });
    nextBtnContainer.add([nextBtnRect, nextBtnText]);
    nextBtnContainer.setVisible(this.scannedFlagIds.size >= 3);
    root.add(nextBtnContainer);

    rebuildChecklist();

    // 4 зоны на экране смартфона для сканирования
    FAKE_CALL_SCANNER_SPOTS.forEach((spot, index) => {
      const sy = phoneY + 46 + index * 86;
      const sw = phoneW - 32;
      const sh = 74;
      const sx = phoneX + 16;

      const spotGraphics = this.add.graphics();
      const drawSpot = (hovered: boolean) => {
        const isScannedFlag = spot.isFlag && this.scannedFlagIds.has(spot.id);
        spotGraphics.clear();
        spotGraphics.fillStyle(
          isScannedFlag ? 0x3b1219 : hovered ? 0x162847 : 0x0f1d36,
          0.95,
        );
        spotGraphics.fillRoundedRect(sx, sy, sw, sh, 14);
        spotGraphics.lineStyle(
          2,
          isScannedFlag ? 0xf87171 : hovered ? 0x00d9ff : 0x334155,
          0.9,
        );
        spotGraphics.strokeRoundedRect(sx, sy, sw, sh, 14);
      };
      drawSpot(false);

      const labelTxt = this.add.text(sx + 16, sy + 14, spot.label[this.locale], {
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
      });
      const subTxt = this.add.text(sx + 16, sy + 38, spot.sublabel[this.locale], {
        fontSize: "12px",
        color: "#94a3b8",
      });
      const scanBadge = this.add
        .text(
          sx + sw - 14,
          sy + sh / 2,
          spot.isFlag && this.scannedFlagIds.has(spot.id)
            ? this.locale === "ro"
              ? "INDICU ✓"
              : "УЛИКА ✓"
            : "🔍 SCAN",
          {
            fontSize: "11px",
            fontStyle: "bold",
            color: spot.isFlag && this.scannedFlagIds.has(spot.id) ? "#f87171" : "#00d9ff",
            backgroundColor: "#060d1f",
            padding: { x: 8, y: 4 },
          },
        )
        .setOrigin(1, 0.5);

      const hit = this.add
        .rectangle(sx + sw / 2, sy + sh / 2, sw, sh, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      hit.on("pointerover", () => {
        drawSpot(true);
        this.scannerReticle?.setPosition(sx + sw / 2, sy + sh / 2).setVisible(true);
      });
      hit.on("pointerout", () => {
        drawSpot(false);
      });
      hit.on("pointerdown", () => {
        if (spot.isFlag) {
          this.scannedFlagIds.add(spot.id);
          scanBadge.setText(this.locale === "ro" ? "INDICIU ✓" : "УЛИКА ✓");
          scanBadge.setColor("#f87171");
        } else {
          scanBadge.setText(this.locale === "ro" ? "NEUTRU" : "НЕЙТРАЛЬНО");
          scanBadge.setColor("#94a3b8");
        }
        drawSpot(true);
        activeFindingTitle.setText(spot.findingTitle[this.locale]);
        activeFindingTitle.setColor(spot.isFlag ? "#f87171" : "#00d9ff");
        activeFindingDesc.setText(spot.findingDesc[this.locale]);
        rebuildChecklist();
        updateRightChecklist();
        this.renderHeader();
      });

      root.add([spotGraphics, labelTxt, subTxt, scanBadge, hit]);
    });

    // Прицел сканера (Phaser Container)
    const reticle = this.add.container(phoneX + phoneW / 2, phoneY + 88);
    const rGraphics = this.add.graphics();
    rGraphics.lineStyle(2, 0x00d9ff, 0.85);
    rGraphics.strokeCircle(0, 0, 26);
    rGraphics.lineBetween(-34, 0, -18, 0);
    rGraphics.lineBetween(18, 0, 34, 0);
    rGraphics.lineBetween(0, -34, 0, -18);
    rGraphics.lineBetween(0, 18, 0, 34);
    reticle.add(rGraphics);
    reticle.setVisible(false);
    this.scannerReticle = reticle;
    root.add(reticle);
  }

  // =========================================================================
  // ЭТАП 2: Перехват радиоволн (Сбей манипуляцию в разговоре)
  // =========================================================================
  private buildStage2WaveDefense(root: Phaser.GameObjects.Container) {
    const { width, height } = this.scale;
    const meta = FAKE_CALL_STAGES_META[this.locale];
    const currentWave = FAKE_CALL_WAVES[this.waveIndex] ?? FAKE_CALL_WAVES[0];

    const title = this.add.text(28, 114, meta.stage2Title, {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#ffffff",
    });
    const subtitle = this.add.text(28, 138, meta.stage2Subtitle, {
      fontSize: "13px",
      color: "#cbd5e1",
      wordWrap: { width: width - 56 },
    });
    root.add([title, subtitle]);

    // Экран осциллографа радиоволн
    const radarX = 28;
    const radarY = 172;
    const radarW = width - 56;
    const radarH = 195;

    const radarBg = this.add.graphics();
    radarBg.fillStyle(0x060d1f, 0.96);
    radarBg.fillRoundedRect(radarX, radarY, radarW, radarH, 18);
    radarBg.lineStyle(2, this.waveSolved ? 0x34d399 : 0xf87171, 0.8);
    radarBg.strokeRoundedRect(radarX, radarY, radarW, radarH, 18);
    root.add(radarBg);

    this.waveGraphics = this.add.graphics();
    root.add(this.waveGraphics);
    this.drawOscilloscopeWave();

    const waveCountBadge = this.add.text(
      radarX + 18,
      radarY + 14,
      this.locale === "ro"
        ? `Unda sonoră ${this.waveIndex + 1} din ${FAKE_CALL_WAVES.length} · ${currentWave.manipulationType.ro}`
        : `Звуковая волна ${this.waveIndex + 1} из ${FAKE_CALL_WAVES.length} · ${currentWave.manipulationType.ru}`,
      {
        fontSize: "13px",
        fontStyle: "bold",
        color: "#ffd166",
      },
    );

    const quoteBox = this.add
      .text(radarX + radarW / 2, radarY + 108, currentWave.callerQuote[this.locale], {
        fontSize: "17px",
        fontStyle: "bold",
        color: this.waveSolved ? "#34d399" : "#ffffff",
        backgroundColor: "#0a1528dd",
        padding: { x: 16, y: 10 },
        wordWrap: { width: radarW - 60 },
        align: "center",
      })
      .setOrigin(0.5);

    const feedbackText = this.add
      .text(
        radarX + radarW / 2,
        radarY + radarH - 24,
        this.waveSolved
          ? currentWave.successFeedback[this.locale]
          : this.locale === "ro"
            ? "Alege mai jos scutul de frecvență potrivit pentru a neutraliza această manipulare!"
            : "Выбери ниже правильный частотный щит, чтобы разрушить эту звуковую манипуляцию!",
        {
          fontSize: "13px",
          fontStyle: "bold",
          color: this.waveSolved ? "#34d399" : "#00d9ff",
          wordWrap: { width: radarW - 40 },
          align: "center",
        },
      )
      .setOrigin(0.5);

    root.add([waveCountBadge, quoteBox, feedbackText]);

    // 3 кнопки частотных щитов
    const shieldGap = 14;
    const shieldW = (radarW - shieldGap * 2) / 3;
    const shieldH = 86;
    const shieldY = 384;

    meta.stage2Shields.forEach((shieldTitle, idx) => {
      const sx = radarX + idx * (shieldW + shieldGap);
      const isCorrectShield = idx === currentWave.correctShieldIndex;

      const sBg = this.add.graphics();
      const drawShield = (hovered: boolean, wrongFlash = false) => {
        sBg.clear();
        const activeCorrect = this.waveSolved && isCorrectShield;
        sBg.fillStyle(
          activeCorrect
            ? 0x064e3b
            : wrongFlash
              ? 0x450a0a
              : hovered
                ? 0x162847
                : 0x112240,
          0.95,
        );
        sBg.fillRoundedRect(sx, shieldY, shieldW, shieldH, 14);
        sBg.lineStyle(
          2,
          activeCorrect
            ? 0x34d399
            : wrongFlash
              ? 0xf87171
              : hovered
                ? 0x00d9ff
                : 0x334155,
          0.95,
        );
        sBg.strokeRoundedRect(sx, shieldY, shieldW, shieldH, 14);
      };
      drawShield(false);

      const sTxt = this.add
        .text(sx + shieldW / 2, shieldY + shieldH / 2, `🛡️ ${shieldTitle}`, {
          fontSize: "14px",
          fontStyle: "bold",
          color: "#ffffff",
          wordWrap: { width: shieldW - 24 },
          align: "center",
        })
        .setOrigin(0.5);

      const sHit = this.add
        .rectangle(sx + shieldW / 2, shieldY + shieldH / 2, shieldW, shieldH, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      sHit.on("pointerover", () => {
        if (!this.waveSolved) drawShield(true);
      });
      sHit.on("pointerout", () => {
        if (!this.waveSolved) drawShield(false);
      });
      sHit.on("pointerdown", () => {
        if (this.waveSolved) return;
        if (isCorrectShield) {
          this.waveSolved = true;
          drawShield(true);
          feedbackText.setText(currentWave.successFeedback[this.locale]);
          feedbackText.setColor("#34d399");
          quoteBox.setColor("#34d399");
          nextWaveBtn.setVisible(true);
          this.renderHeader();
        } else {
          drawShield(false, true);
          feedbackText.setText(currentWave.wrongFeedback[this.locale]);
          feedbackText.setColor("#f87171");
        }
      });

      root.add([sBg, sTxt, sHit]);
    });

    // Кнопка следующей волны / этапа
    const nextWaveBtn = this.add.container(width / 2, height - 56);
    const btnRect = this.add
      .rectangle(0, 0, 420, 46, 0x00d9ff, 1)
      .setInteractive({ useHandCursor: true });
    const btnLabel = this.add
      .text(
        0,
        0,
        this.waveIndex + 1 < FAKE_CALL_WAVES.length
          ? this.locale === "ro"
            ? "Următoarea undă sonoră →"
            : "Перейти к следующей звуковой волне →"
          : meta.nextStageBtn,
        {
          fontSize: "14px",
          fontStyle: "bold",
          color: "#040916",
        },
      )
      .setOrigin(0.5);

    btnRect.on("pointerover", () => btnRect.setFillStyle(0x67e8f9, 1));
    btnRect.on("pointerout", () => btnRect.setFillStyle(0x00d9ff, 1));
    btnRect.on("pointerdown", () => {
      if (this.waveIndex + 1 < FAKE_CALL_WAVES.length) {
        this.waveIndex += 1;
        this.waveSolved = false;
        this.renderCurrentStage();
      } else {
        this.stage = 3;
        this.renderCurrentStage();
      }
    });

    nextWaveBtn.add([btnRect, btnLabel]);
    nextWaveBtn.setVisible(this.waveSolved);
    root.add(nextWaveBtn);
  }

  private drawOscilloscopeWave() {
    if (!this.waveGraphics) return;
    const { width } = this.scale;
    const startX = 46;
    const endX = width - 46;
    const centerY = 235;
    const amplitude = this.waveSolved ? 5 : 22;
    const color = this.waveSolved ? 0x34d399 : 0xf87171;

    this.waveGraphics.clear();
    this.waveGraphics.lineStyle(2.5, color, 0.85);
    this.waveGraphics.beginPath();
    for (let x = startX; x <= endX; x += 6) {
      const y =
        centerY +
        Math.sin((x - startX) * 0.045 + this.wavePhase) * amplitude +
        Math.cos((x - startX) * 0.09 - this.wavePhase * 1.4) * (amplitude * 0.4);
      if (x === startX) {
        this.waveGraphics.moveTo(x, y);
      } else {
        this.waveGraphics.lineTo(x, y);
      }
    }
    this.waveGraphics.strokePath();
  }

  // =========================================================================
  // ЭТАП 3: Коммутатор безопасности (Двухканальная проверка)
  // =========================================================================
  private buildStage3Switchboard(root: Phaser.GameObjects.Container) {
    const { width, height } = this.scale;
    const meta = FAKE_CALL_STAGES_META[this.locale];

    const title = this.add.text(28, 114, meta.stage3Title, {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#ffffff",
    });
    const subtitle = this.add.text(28, 138, meta.stage3Subtitle, {
      fontSize: "13px",
      color: "#cbd5e1",
      wordWrap: { width: width - 56 },
    });
    root.add([title, subtitle]);

    this.wireGraphics = this.add.graphics();
    root.add(this.wireGraphics);

    const startY = 178;
    const rowH = 104;
    const rowGap = 12;

    FAKE_CALL_SWITCH_NODES.forEach((node, idx) => {
      const y = startY + idx * (rowH + rowGap);
      const isSwitched = this.switchedNodeIds.has(node.id);

      const cardBg = this.add.graphics();
      cardBg.fillStyle(isSwitched ? 0x06362d : 0x0f1d36, 0.94);
      cardBg.fillRoundedRect(28, y, width - 56, rowH, 16);
      cardBg.lineStyle(2, isSwitched ? 0x34d399 : 0xf59e0b, 0.85);
      cardBg.strokeRoundedRect(28, y, width - 56, rowH, 16);

      const nodeTitle = this.add.text(46, y + 12, node.title[this.locale], {
        fontSize: "15px",
        fontStyle: "bold",
        color: isSwitched ? "#34d399" : "#ffd166",
      });

      const stateText = this.add.text(
        46,
        y + 36,
        isSwitched ? node.safeState[this.locale] : node.unsafeState[this.locale],
        {
          fontSize: "13px",
          fontStyle: "bold",
          color: isSwitched ? "#d1fae5" : "#fca5a5",
        },
      );

      const explText = this.add.text(46, y + 60, node.explanation[this.locale], {
        fontSize: "12px",
        color: "#cbd5e1",
        wordWrap: { width: width - 310 },
      });

      const btnW = 215;
      const btnH = 44;
      const btnX = width - 46 - btnW / 2;
      const btnY = y + rowH / 2;

      const switchRect = this.add
        .rectangle(btnX, btnY, btnW, btnH, isSwitched ? 0x059669 : 0x00d9ff, 1)
        .setInteractive({ useHandCursor: true });

      const switchTxt = this.add
        .text(
          btnX,
          btnY,
          isSwitched ? meta.stage3SwitchedBadge : meta.stage3SwitchBtn,
          {
            fontSize: "12px",
            fontStyle: "bold",
            color: isSwitched ? "#ffffff" : "#040916",
          },
        )
        .setOrigin(0.5);

      switchRect.on("pointerdown", () => {
        if (!this.switchedNodeIds.has(node.id)) {
          this.switchedNodeIds.add(node.id);
          this.renderCurrentStage();
        }
      });

      root.add([cardBg, nodeTitle, stateText, explText, switchRect, switchTxt]);
    });

    this.drawCircuitWires();

    // Кнопка перехода к Этапу 4 (Дуэль)
    const allSwitched = this.switchedNodeIds.size >= FAKE_CALL_SWITCH_NODES.length;
    const nextStageBtn = this.add.container(width / 2, height - 42);
    const nextRect = this.add
      .rectangle(0, 0, 420, 42, 0x00d9ff, 1)
      .setInteractive({ useHandCursor: true });
    const nextTxt = this.add
      .text(0, 0, meta.nextStageBtn, {
        fontSize: "14px",
        fontStyle: "bold",
        color: "#040916",
      })
      .setOrigin(0.5);

    nextRect.on("pointerdown", () => {
      this.stage = 4;
      this.renderCurrentStage();
    });
    nextStageBtn.add([nextRect, nextTxt]);
    nextStageBtn.setVisible(allSwitched);
    root.add(nextStageBtn);
  }

  private drawCircuitWires() {
    if (!this.wireGraphics) return;
    const { width } = this.scale;
    this.wireGraphics.clear();

    const startY = 178;
    const rowH = 104;
    const rowGap = 12;

    FAKE_CALL_SWITCH_NODES.forEach((node, idx) => {
      const isSwitched = this.switchedNodeIds.has(node.id);
      const y = startY + idx * (rowH + rowGap) + rowH / 2;
      const x1 = width - 290;
      const x2 = width - 265;

      this.wireGraphics!.lineStyle(3, isSwitched ? 0x34d399 : 0x475569, 0.8);
      this.wireGraphics!.lineBetween(x1, y, x2, y);

      if (isSwitched) {
        const pulseX = x1 + (x2 - x1) * this.wirePulseProgress;
        this.wireGraphics!.fillStyle(0x6ee7b7, 1);
        this.wireGraphics!.fillCircle(pulseX, y, 4.5);
      }
    });
  }

  // =========================================================================
  // ЭТАП 4: Дуэль с телефонным мошенником (Контрольный вопрос)
  // =========================================================================
  private buildStage4Duel(root: Phaser.GameObjects.Container) {
    const { width, height } = this.scale;
    const meta = FAKE_CALL_STAGES_META[this.locale];
    const round = FAKE_CALL_DUEL_ROUNDS[this.duelRoundIndex] ?? FAKE_CALL_DUEL_ROUNDS[0];

    const title = this.add.text(28, 114, meta.stage4Title, {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#ffffff",
    });
    const subtitle = this.add.text(28, 138, meta.stage4Subtitle, {
      fontSize: "13px",
      color: "#cbd5e1",
      wordWrap: { width: width - 56 },
    });
    root.add([title, subtitle]);

    // Арена дуэли (y: 170..325)
    const arenaY = 170;
    const arenaH = 148;
    const arenaW = width - 56;
    const arenaBg = this.add.graphics();
    arenaBg.fillStyle(0x060d1f, 0.96);
    arenaBg.fillRoundedRect(28, arenaY, arenaW, arenaH, 18);
    arenaBg.lineStyle(2, 0x00d9ff, 0.5);
    arenaBg.strokeRoundedRect(28, arenaY, arenaW, arenaH, 18);
    root.add(arenaBg);

    // Спрайты Друга слева и Тени справа
    const friendSprite = this.add
      .image(92, arenaY + 74, "npc-female", "idle")
      .setScale(0.45)
      .setTint(0xffd9e8);
    const shadowSprite = this.add
      .image(width - 92, arenaY + 74, "shadow", "idle")
      .setScale(0.48);

    // HP Маскировки Тени
    const hpLabel = this.add
      .text(
        width - 165,
        arenaY + 20,
        this.locale === "ro"
          ? `Masca Umbrei: ${this.shadowHp} HP`
          : `Маскировка Тени: ${this.shadowHp} HP`,
        {
          fontSize: "13px",
          fontStyle: "bold",
          color: "#f87171",
        },
      )
      .setOrigin(1, 0);

    const hpBar = this.add.graphics();
    hpBar.fillStyle(0x334155, 1);
    hpBar.fillRoundedRect(width - 305, arenaY + 42, 140, 10, 5);
    if (this.shadowHp > 0) {
      hpBar.fillStyle(0xef4444, 1);
      hpBar.fillRoundedRect(width - 305, arenaY + 42, (140 * this.shadowHp) / 100, 10, 5);
    }

    // Реплика атаки Тени по центру арены
    const attackBubble = this.add
      .text(width / 2, arenaY + 76, round.shadowAttack[this.locale], {
        fontSize: "14px",
        fontStyle: "bold",
        color: "#fecaca",
        backgroundColor: "#1f1224",
        padding: { x: 14, y: 10 },
        wordWrap: { width: arenaW - 310 },
        align: "center",
      })
      .setOrigin(0.5);

    const duelFeedback = this.add
      .text(
        width / 2,
        arenaY + arenaH - 18,
        this.locale === "ro"
          ? "Alege o carte de contraatac mai jos:"
          : "Выбери карту контр-приёма ниже:",
        {
          fontSize: "12px",
          fontStyle: "bold",
          color: "#00d9ff",
        },
      )
      .setOrigin(0.5);

    root.add([friendSprite, shadowSprite, hpLabel, hpBar, attackBubble, duelFeedback]);

    // 3 тактические карты внизу (y: 332..565)
    const cardGap = 14;
    const cardW = (arenaW - cardGap * 2) / 3;
    const cardH = height - 354;
    const cardY = 332;

    round.cards.forEach((card, idx) => {
      const cx = 28 + idx * (cardW + cardGap);

      const cBg = this.add.graphics();
      const drawCard = (hovered: boolean, wrong = false) => {
        cBg.clear();
        cBg.fillStyle(wrong ? 0x450a0a : hovered ? 0x162847 : 0x112240, 0.96);
        cBg.fillRoundedRect(cx, cardY, cardW, cardH, 16);
        cBg.lineStyle(2, wrong ? 0xf87171 : hovered ? 0x00d9ff : 0x334155, 0.95);
        cBg.strokeRoundedRect(cx, cardY, cardW, cardH, 16);
      };
      drawCard(false);

      const cTitle = this.add
        .text(cx + cardW / 2, cardY + 26, card.title[this.locale], {
          fontSize: "14px",
          fontStyle: "bold",
          color: "#ffd166",
          wordWrap: { width: cardW - 24 },
          align: "center",
        })
        .setOrigin(0.5, 0);

      const cDesc = this.add
        .text(cx + cardW / 2, cardY + 76, card.desc[this.locale], {
          fontSize: "13px",
          color: "#e2e8f0",
          wordWrap: { width: cardW - 28 },
          align: "center",
          lineSpacing: 4,
        })
        .setOrigin(0.5, 0);

      const playBadge = this.add
        .text(
          cx + cardW / 2,
          cardY + cardH - 26,
          this.locale === "ro" ? "⚡ Joacă cartea" : "⚡ Разыграть карту",
          {
            fontSize: "12px",
            fontStyle: "bold",
            color: "#00d9ff",
          },
        )
        .setOrigin(0.5);

      const cHit = this.add
        .rectangle(cx + cardW / 2, cardY + cardH / 2, cardW, cardH, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      cHit.on("pointerover", () => drawCard(true));
      cHit.on("pointerout", () => drawCard(false));
      cHit.on("pointerdown", () => {
        if (card.correct) {
          this.shadowHp = Math.max(0, this.shadowHp - 50);
          this.cameras.main.flash(180, 0, 217, 255);
          if (this.duelRoundIndex + 1 < FAKE_CALL_DUEL_ROUNDS.length) {
            this.duelRoundIndex += 1;
            this.renderCurrentStage();
          } else {
            this.stage = 5;
            this.renderCurrentStage();
          }
        } else {
          drawCard(false, true);
          duelFeedback.setText(card.feedback[this.locale]);
          duelFeedback.setColor("#f87171");
        }
      });

      root.add([cBg, cTitle, cDesc, playBadge, cHit]);
    });
  }

  // =========================================================================
  // ЭТАП 5: Финал и сводка правил по категории «Ложные вызовы»
  // =========================================================================
  private buildStage5Victory(root: Phaser.GameObjects.Container) {
    const { width, height } = this.scale;
    const meta = FAKE_CALL_STAGES_META[this.locale];

    const title = this.add
      .text(width / 2, 134, `🛡️ ${meta.victoryTitle}`, {
        fontSize: "22px",
        fontStyle: "bold",
        color: "#34d399",
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(width / 2, 172, meta.victorySubtitle, {
        fontSize: "14px",
        color: "#e2e8f0",
        wordWrap: { width: width - 100 },
        align: "center",
      })
      .setOrigin(0.5);

    root.add([title, subtitle]);

    const boxX = 48;
    const boxY = 212;
    const boxW = width - 96;
    const boxH = 270;

    const rulesBg = this.add.graphics();
    rulesBg.fillStyle(0x112240, 0.9);
    rulesBg.fillRoundedRect(boxX, boxY, boxW, boxH, 18);
    rulesBg.lineStyle(2, 0x34d399, 0.6);
    rulesBg.strokeRoundedRect(boxX, boxY, boxW, boxH, 18);
    root.add(rulesBg);

    meta.victoryRules.forEach((ruleText, idx) => {
      const ry = boxY + 26 + idx * 58;
      const rTxt = this.add.text(boxX + 24, ry, `✓  ${ruleText}`, {
        fontSize: "14px",
        fontStyle: "bold",
        color: "#f8fafc",
        wordWrap: { width: boxW - 48 },
      });
      root.add(rTxt);
    });

    const finishRect = this.add
      .rectangle(width / 2, height - 56, 460, 50, 0x34d399, 1)
      .setInteractive({ useHandCursor: true });
    const finishTxt = this.add
      .text(width / 2, height - 56, meta.finishBtn, {
        fontSize: "16px",
        fontStyle: "bold",
        color: "#040916",
      })
      .setOrigin(0.5);

    finishRect.on("pointerover", () => finishRect.setFillStyle(0x6ee7b7, 1));
    finishRect.on("pointerout", () => finishRect.setFillStyle(0x34d399, 1));
    finishRect.on("pointerdown", () => {
      this.onComplete?.(true);
      this.scene.stop();
    });

    root.add([finishRect, finishTxt]);
  }

  private closeScene() {
    this.onClose?.();
    this.scene.stop();
  }
}
