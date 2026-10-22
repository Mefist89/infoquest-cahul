import Phaser from "phaser";

import { PATROL_NPCS } from "@/data/patrol";

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
  private isSelecting = false;

  constructor() {
    super("dialogue");
  }

  init(data: DialogueSceneData) {
    this.npcId = data.npcId;
    this.locale = data.locale;
    this.onComplete = data.onComplete;
    this.npcData = PATROL_NPCS.find((npc) => npc.id === this.npcId);
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

    const portrait = this.add.image(avatarCenterX, centerY - 22, npc.sprite, "idle");
    portrait.setScale(0.62);
    portrait.setTint(npc.tint ?? 0xffffff);

    this.add
      .text(avatarCenterX, avatarBoxTop + avatarBoxHeight - 48, npc.name[this.locale], {
        fontSize: "17px",
        fontStyle: "bold",
        color: "#ffd166",
        fontFamily: "'Orbitron', sans-serif",
        align: "center",
        wordWrap: { width: avatarBoxWidth - 20 },
      })
      .setOrigin(0.5);

    // Правая колонка внутри карточки: заголовок, описание ситуации и кнопки выбора
    const contentLeft = avatarBoxLeft + avatarBoxWidth + 24;
    const contentRight = cardRight - 24;
    const contentWidth = contentRight - contentLeft;
    const contentCenterX = contentLeft + contentWidth / 2;

    // Заголовок диалога
    this.add
      .text(contentCenterX, cardTop + 36, npc.name[this.locale], {
        fontSize: "21px",
        fontStyle: "bold",
        color: "#00d9ff",
        fontFamily: "'Orbitron', sans-serif",
      })
      .setOrigin(0.5);

    const divider = this.add.graphics();
    divider.lineStyle(1, 0x00d9ff, 0.25);
    divider.lineBetween(contentLeft + 12, cardTop + 62, contentRight - 12, cardTop + 62);

    // Текст ситуации
    this.add
      .text(contentCenterX, cardTop + 82, npc.situation[this.locale], {
        fontSize: "18px",
        color: "#e2e8f0",
        fontFamily: "'Geist', sans-serif",
        wordWrap: { width: contentWidth - 24 },
        lineSpacing: 7,
        align: "center",
      })
      .setOrigin(0.5, 0);

    // Варианты ответа (гарантированно внутри нижней границы карточки)
    const optionHeight = 64;
    const optionSpacing = 14;
    const optionWidth = contentWidth - 12;
    const optionCount = this.npcData.options.length;
    const totalOptionsHeight = optionCount * optionHeight + Math.max(0, optionCount - 1) * optionSpacing;
    const firstOptionY = cardBottom - 24 - totalOptionsHeight + optionHeight / 2;

    this.npcData.options.forEach((option, index) => {
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
        .text(contentCenterX, optionY, `${index + 1}. ${option.text[this.locale]}`, {
          fontSize: "17px",
          fontStyle: "bold",
          color: "#ffffff",
          fontFamily: "'Geist', sans-serif",
          wordWrap: { width: optionWidth - 36 },
          align: "center",
        })
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
    });

    // Навигация с клавиатуры (клавиши 1, 2, 3)
    this.input.keyboard?.on("keydown-ONE", () => this.selectOption(0));
    this.input.keyboard?.on("keydown-TWO", () => this.selectOption(1));
    this.input.keyboard?.on("keydown-THREE", () => this.selectOption(2));
  }

  private selectOption(optionIndex: number) {
    if (!this.npcData || this.isSelecting) return;

    const option = this.npcData.options[optionIndex];
    if (!option) return;

    this.isSelecting = true;
    const isCorrect = option.correct;
    this.onComplete?.(isCorrect);
    this.events.emit("dialogue-complete", isCorrect);
    this.scene.stop();
  }
}