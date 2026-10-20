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

  constructor() {
    super("dialogue");
  }

  init(data: DialogueSceneData) {
    this.npcId = data.npcId;
    this.locale = data.locale;
    this.onComplete = data.onComplete;
    this.npcData = PATROL_NPCS.find((npc) => npc.id === this.npcId);
  }

  create() {
    if (!this.npcData) {
      this.scene.stop();
      return;
    }

    const { width, height } = this.scale;
    const npc = this.npcData;

    // Dark overlay background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    // NPC portrait (left side)
    const portraitX = width * 0.15;
    const centerY = height * 0.5;
    const portrait = this.add.image(portraitX, centerY, npc.sprite, "idle");
    portrait.setScale(0.6);
    portrait.setTint(npc.tint ?? 0xffffff);

    // NPC name
    this.add.text(portraitX, centerY - 180, npc.name[this.locale], {
      fontSize: "24px",
      fontStyle: "bold",
      color: "#ffd166",
      fontFamily: "'Orbitron', sans-serif",
      align: "center",
      wordWrap: { width: 300 }
    }).setOrigin(0.5);

    // Dialogue box (right side)
    const boxX = width * 0.55;
    const boxWidth = width * 0.75;
    const boxHeight = height * 0.65;
    const boxY = centerY;

    const dialogueBox = this.add.graphics();
    dialogueBox.fillStyle(0x0a1528, 0.95);
    dialogueBox.fillRoundedRect(
      boxX - boxWidth / 2,
      boxY - boxHeight / 2,
      boxWidth,
      boxHeight,
      24
    );
    dialogueBox.lineStyle(3, 0x00d9ff, 0.8);
    dialogueBox.strokeRoundedRect(
      boxX - boxWidth / 2,
      boxY - boxHeight / 2,
      boxWidth,
      boxHeight,
      24
    );

    // NPC name label
    this.add.text(boxX, boxY - boxHeight / 2 + 30, npc.name[this.locale], {
      fontSize: "20px",
      fontStyle: "bold",
      color: "#00d9ff",
      fontFamily: "'Orbitron', sans-serif"
    }).setOrigin(0.5);

    // Situation text
    this.add.text(
      boxX,
      boxY - boxHeight / 2 + 80,
      npc.situation[this.locale],
      {
        fontSize: "18px",
        color: "#e0e0e0",
        fontFamily: "'Geist', sans-serif",
        wordWrap: { width: boxWidth - 80 },
        lineSpacing: 8,
        align: "center"
      }
    ).setOrigin(0.5, 0);

    // Options container
    const optionsContainer = this.add.container(boxX, boxY + boxHeight / 2 - 100);

    const optionHeight = 70;
    const optionSpacing = 15;
    const optionWidth = boxWidth - 100;

    this.npcData.options.forEach((option, index) => {
      const y = index * (optionHeight + optionSpacing);
      
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a2e, 0.9);
      bg.fillRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 16);
      bg.lineStyle(2, 0x00d9ff, 0.3);
      bg.strokeRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 16);

      const text = this.add.text(0, 0, option.text[this.locale], {
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ffffff",
        fontFamily: "'Geist', sans-serif",
        wordWrap: { width: optionWidth - 40 },
        align: "center"
      }).setOrigin(0.5);

      const optionContainer = this.add.container(0, y, [bg, text]);
      optionContainer.setSize(optionWidth, optionHeight);
      optionContainer.setInteractive(
        new Phaser.Geom.Rectangle(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight),
        Phaser.Geom.Rectangle.Contains
      );

      optionContainer.on("pointerover", () => {
        bg.clear();
        bg.fillStyle(0x00d9ff, 0.15);
        bg.fillRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 16);
        bg.lineStyle(2, 0x00d9ff, 0.8);
        bg.strokeRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 16);
        text.setColor("#00d9ff");
      });

      optionContainer.on("pointerout", () => {
        bg.clear();
        bg.fillStyle(0x1a1a2e, 0.9);
        bg.fillRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 16);
        bg.lineStyle(2, 0x00d9ff, 0.3);
        bg.strokeRoundedRect(-optionWidth / 2, -optionHeight / 2, optionWidth, optionHeight, 16);
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

    // Fade in animation
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  private selectOption(optionIndex: number) {
    if (!this.npcData) return;

    const option = this.npcData.options[optionIndex];
    if (!option) return;

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.events.emit("dialogue-complete", option.correct);
      this.scene.stop();
    });
  }
}