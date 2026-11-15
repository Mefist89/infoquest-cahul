import Phaser from "phaser";

import { PATROL_NPCS, PATROL_SCENE_META } from "@/data/patrol";
import { shuffle } from "./shuffle";
import { gameText } from "./text-style";

export type PatrolLocale = "ru" | "ro";

export interface DialogueSceneData {
  npcId: string;
  locale: PatrolLocale;
  onComplete?: (correct: boolean) => void;
}

export class DialogueScene extends Phaser.Scene {
  private npcId!: string;
  private locale!: PatrolLocale;
  private onComplete?: (correct: boolean) => void;
  private npcData: (typeof PATROL_NPCS)[0] | undefined;
  private displayedOptions: (typeof PATROL_NPCS)[0]["options"] = [];
  private isSelecting = false;
  private optionsContainer?: Phaser.GameObjects.Container;
  private contentCenterX = 0;
  private contentWidth = 0;
  private cardBottom = 0;
  private situationBottomY = 0;

  constructor() {
    super("dialogue");
  }

  init(data: DialogueSceneData) {
    this.npcId = data.npcId;
    this.locale = data.locale;
    this.onComplete = data.onComplete;
    this.npcData = PATROL_NPCS.find((npc) => npc.id === this.npcId);
    this.displayedOptions = this.npcData ? shuffle(this.npcData.options) : [];
    this.isSelecting = false;
  }

  create() {
    if (!this.npcData) {
      this.scene.stop();
      return;
    }

    const { width, height } = this.scale;
    const npc = this.npcData;

    // Защитный полноэкранный фон-затемнение
    this.add.rectangle(0, 0, width, height, 0x040916, 0.88).setOrigin(0);

    // Единая карточка диалога по центру экрана
    const cardWidth = Math.min(860, width - 48);
    const cardHeight = Math.min(430, height - 64);
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const cardLeft = centerX - cardWidth / 2;
    const cardRight = centerX + cardWidth / 2;
    const cardTop = centerY - cardHeight / 2;
    const cardBottom = centerY + cardHeight / 2;

    const dialogueBox = this.add.graphics();
    dialogueBox.fillStyle(0x0a1528, 0.98);
    dialogueBox.fillRoundedRect(cardLeft, cardTop, cardWidth, cardHeight, 24);
    dialogueBox.lineStyle(3, 0x00d9ff, 0.85);
    dialogueBox.strokeRoundedRect(cardLeft, cardTop, cardWidth, cardHeight, 24);

    // Левая колонка внутри карточки: портрет и имя персонажа
    const avatarBoxWidth = 186;
    const avatarBoxHeight = cardHeight - 44;
    const avatarBoxLeft = cardLeft + 22;
    const avatarBoxTop = cardTop + 22;
    const avatarCenterX = avatarBoxLeft + avatarBoxWidth / 2;

    const avatarBg = this.add.graphics();
    avatarBg.fillStyle(0x112240, 0.85);
    avatarBg.fillRoundedRect(avatarBoxLeft, avatarBoxTop, avatarBoxWidth, avatarBoxHeight, 18);
    avatarBg.lineStyle(1.5, 0x00d9ff, 0.35);
    avatarBg.strokeRoundedRect(avatarBoxLeft, avatarBoxTop, avatarBoxWidth, avatarBoxHeight, 18);

    const portrait = this.add.image(avatarCenterX, centerY, npc.sprite, "idle");
    portrait.setScale(0.62);
    portrait.setTint(npc.tint ?? 0xffffff);

    // Правая колонка внутри карточки: заголовок, описание ситуации и кнопки выбора
    const contentLeft = avatarBoxLeft + avatarBoxWidth + 24;
    const contentRight = cardRight - 24;
    const contentWidth = contentRight - contentLeft;
    const contentCenterX = contentLeft + contentWidth / 2;

    // Заголовок диалога
    this.add
      .text(
        contentCenterX,
        cardTop + 36,
        npc.name[this.locale],
        gameText("21px", {
          fontStyle: "bold",
          color: "#00d9ff",
        }),
      )
      .setOrigin(0.5);

    const divider = this.add.graphics();
    divider.lineStyle(1, 0x00d9ff, 0.25);
    divider.lineBetween(contentLeft + 12, cardTop + 62, contentRight - 12, cardTop + 62);

    // Текст ситуации
    const situationText = this.add
      .text(
        contentCenterX,
        cardTop + 82,
        npc.situation[this.locale],
        gameText("18px", {
          color: "#e2e8f0",
          wordWrap: { width: contentWidth - 24 },
          lineSpacing: 7,
          align: "center",
        }),
      )
      .setOrigin(0.5, 0);

    this.contentCenterX = contentCenterX;
    this.contentWidth = contentWidth;
    this.cardBottom = cardBottom;
    this.situationBottomY = situationText.y + situationText.height;
    this.optionsContainer = this.add.container(0, 0);

    // Варианты ответа (гарантированно внутри нижней границы карточки)
    const optionHeight = 64;
    const optionSpacing = 14;
    const optionWidth = contentWidth - 12;
    const optionCount = this.displayedOptions.length;
    const totalOptionsHeight = optionCount * optionHeight + Math.max(0, optionCount - 1) * optionSpacing;
    const firstOptionY = cardBottom - 24 - totalOptionsHeight + optionHeight / 2;

    this.displayedOptions.forEach((option, index) => {
      const optionY = firstOptionY + index * (optionHeight + optionSpacing);

      const bg = this.add.graphics();
      const drawBg = (hovered: boolean) => {
        bg.clear();
        bg.fillStyle(hovered ? 0x00d9ff : 0x162440, hovered ? 0.22 : 0.95);
        bg.fillRoundedRect(
          contentCenterX - optionWidth / 2,
          optionY - optionHeight / 2,
          optionWidth,
          optionHeight,
          14,
        );
        bg.lineStyle(2, 0x00d9ff, hovered ? 0.95 : 0.4);
        bg.strokeRoundedRect(
          contentCenterX - optionWidth / 2,
          optionY - optionHeight / 2,
          optionWidth,
          optionHeight,
          14,
        );
      };
      drawBg(false);

      const text = this.add
        .text(
          contentCenterX,
          optionY,
          `${index + 1}. ${option.text[this.locale]}`,
          gameText("17px", {
            fontStyle: "bold",
            color: "#ffffff",
            wordWrap: { width: optionWidth - 36 },
            align: "center",
          }),
        )
        .setOrigin(0.5);

      const hitZone = this.add
        .rectangle(contentCenterX, optionY, optionWidth, optionHeight, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      hitZone.on("pointerover", () => {
        drawBg(true);
        text.setColor("#00d9ff");
      });

      hitZone.on("pointerout", () => {
        drawBg(false);
        text.setColor("#ffffff");
      });

      hitZone.on("pointerdown", () => {
        this.selectOption(index);
      });

      this.optionsContainer?.add([bg, text, hitZone]);
    });

    // Навигация с клавиатуры (клавиши 1, 2, 3)
    this.input.keyboard?.on("keydown-ONE", () => this.selectOption(0));
    this.input.keyboard?.on("keydown-TWO", () => this.selectOption(1));
    this.input.keyboard?.on("keydown-THREE", () => this.selectOption(2));
  }

  private selectOption(optionIndex: number) {
    if (!this.npcData || this.isSelecting) return;

    const option = this.displayedOptions[optionIndex];
    if (!option) return;

    this.isSelecting = true;
    const isCorrect = option.correct;
    const meta = PATROL_SCENE_META[this.locale];

    this.optionsContainer?.destroy(true);

    const feedbackStr = isCorrect
      ? this.npcData.success[this.locale]
      : this.npcData.fail[this.locale];
    const boxWidth = this.contentWidth - 12;

    const feedbackText = this.add
      .text(
        this.contentCenterX,
        0,
        feedbackStr,
        gameText("15.5px", {
          fontStyle: "bold",
          color: isCorrect ? "#d1fae5" : "#fecaca",
          wordWrap: { width: boxWidth - 36 },
          align: "center",
          lineSpacing: 4,
        }),
      )
      .setOrigin(0.5);

    const feedbackBoxH = Math.max(76, feedbackText.height + 28);
    const btnH = 48;
    const btnY = this.cardBottom - 26 - btnH / 2;
    const feedbackCenterY = Math.max(
      this.situationBottomY + 14 + feedbackBoxH / 2,
      btnY - btnH / 2 - 14 - feedbackBoxH / 2,
    );
    feedbackText.setY(feedbackCenterY);

    const feedbackBg = this.add.graphics();
    feedbackBg.fillStyle(isCorrect ? 0x064e3b : 0x450a0a, 0.92);
    feedbackBg.fillRoundedRect(
      this.contentCenterX - boxWidth / 2,
      feedbackCenterY - feedbackBoxH / 2,
      boxWidth,
      feedbackBoxH,
      14,
    );
    feedbackBg.lineStyle(2, isCorrect ? 0x34d399 : 0xf87171, 0.9);
    feedbackBg.strokeRoundedRect(
      this.contentCenterX - boxWidth / 2,
      feedbackCenterY - feedbackBoxH / 2,
      boxWidth,
      feedbackBoxH,
      14,
    );
    this.children.bringToTop(feedbackText);

    const btnLabel = isCorrect ? meta.dialogueNextBtn : meta.dialogueRetryBtn;
    const btnTxt = this.add
      .text(
        this.contentCenterX,
        btnY,
        btnLabel,
        gameText("16px", {
          fontStyle: "900",
          color: isCorrect ? "#040916" : "#ffffff",
          align: "center",
        }),
      )
      .setOrigin(0.5);

    const btnW = Math.max(240, btnTxt.width + 48);
    const btnBg = this.add
      .rectangle(
        this.contentCenterX,
        btnY,
        btnW,
        btnH,
        isCorrect ? 0x34d399 : 0xef4444,
        1,
      )
      .setStrokeStyle(2, isCorrect ? 0xa7f3d0 : 0xfca5a5)
      .setInteractive({ useHandCursor: true });

    this.children.bringToTop(btnTxt);

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      this.onComplete?.(isCorrect);
      this.events.emit("dialogue-complete", isCorrect);
      this.scene.stop();
    };

    btnBg.on("pointerdown", finish);
    this.input.keyboard?.once("keydown-ENTER", finish);
    this.input.keyboard?.once("keydown-SPACE", finish);
  }
}