import Phaser from "phaser";

import { PATROL_NPCS } from "@/data/patrol";

export type PatrolLocale = "ru" | "ro";

export interface DialogueSceneData {
  npcId: string;
  locale: PatrolLocale;
  onComplete: (correct: boolean) => void;
}

export class DialogueScene extends Phaser.Scene {
  private npcId!: string;
  private locale!: PatrolLocale;
  private onComplete!: (correct: boolean) => void;
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

    // Контейнер вариантов ответа (гарантированно внутри нижней границы карточки)
    const optionHeight = 64;
    const optionSpacing = 14;
    const optionWidth = contentWidth - 12;
    const optionCount = this.npcData.options.length;
    const totalOptionsHeight = optionCount * optionHeight + Math.max(0, optionCount - 1) * optionSpacing;
    const firstOptionY = cardBottom - 24 - totalOptionsHeight + optionHeight / 2;

    const optionsContainer = this.add.container(contentCenterX, firstOptionY);

    this.npcData.options.forEach((option, index) => {
      const y = index * (optionHeight + optionSpacing);

      const bg = this.add.graphics();
      bg.fillStyle(0x162440, 0.95);
      bg.fillRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 14);
      bg.lineStyle(2, 0x00d9ff, 0.35);
      bg.strokeRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 14);

      const text = this.add
        .text(0, 0, `${index + 1}. ${option.text[this.locale]}`, {
          fontSize: "17px",
          fontStyle: "bold",
          color: "#ffffff",
          fontFamily: "'Geist', sans-serif",
          wordWrap: { width: optionWidth - 36 },
          align: "center",
        })
        .setOrigin(0.5);

      const optionContainer = this.add.container(0, y, [bg, text]);
      optionContainer.setSize(optionWidth, optionHeight);
      optionContainer.setInteractive(
        new Phaser.Geom.Rectangle(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight),
        Phaser.Geom.Rectangle.Contains,
      );

      optionContainer.on("pointerover", () => {
        bg.clear();
        bg.fillStyle(0x00d9ff, 0.18);
        bg.fillRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 14);
        bg.lineStyle(2, 0x00d9ff, 0.9);
        bg.strokeRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 14);
        text.setColor("#00d9ff");
      });

      optionContainer.on("pointerout", () => {
        bg.clear();
        bg.fillStyle(0x162440, 0.95);
        bg.fillRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 14);
        bg.lineStyle(2, 0x00d9ff, 0.35);
        bg.strokeRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 14);
        text.setColor("#ffffff");
      });

      optionContainer.on("pointerdown", () => {
        this.selectOption(index);
      });

      optionsContainer.add(optionContainer);
    });

    // Keyboard navigation
    this.input.keyboard?.on("keydown-ONE", () => this.selectOption(0));
    this.input.keyboard?.on("keydown-TWO", () => this.selectOption(1));
    this.input.keyboard?.on("keydown-THREE", () => this.selectOption(2));

    // Перерисовка при изменении размера окна/выходе из полноэкранного режима
    const onResize = () => {
      if (!this.isSelecting && this.sys?.isActive()) {
        this.scene.restart({ npcId: this.npcId, locale: this.locale, onComplete: this.onComplete });
      }
    };
    this.scale.on("resize", onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", onResize);
    });

    // Fade in animation
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  private selectOption(optionIndex: number) {
    if (!this.npcData || this.isSelecting) return;

    const option = this.npcData.options[optionIndex];
    if (!option) return;

    this.isSelecting = true;
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.events.emit("dialogue-complete", option.correct);
      this.scene.stop();
    });
  }
}