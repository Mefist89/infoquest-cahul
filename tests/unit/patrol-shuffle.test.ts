import { describe, expect, it } from "vitest";

import { shuffle } from "@/components/game/shuffle";
import { PATROL_NPCS } from "@/data/patrol";
import {
  BANK_CALL_META,
  BANK_DEFENSE_ROUNDS,
  BANK_PRESSURE_TRAPS,
} from "@/data/patrol-bank-call";
import { DELIVERY_SMS_CASES } from "@/data/patrol-delivery-sms";
import {
  FAKE_CALL_DUEL_ROUNDS,
  FAKE_CALL_STAGES_META,
  FAKE_CALL_WAVES,
} from "@/data/patrol-fake-call";
import {
  HACKED_ACCOUNT_META,
  HACKED_LOGIN_TRAPS,
  HACKED_SHIELD_LAYERS,
} from "@/data/patrol-hacked-account";

describe("shuffle вариантов ответа в 2D-игре «Патруль»", () => {
  it("не мутирует исходный массив и сохраняет состав элементов", () => {
    const original = [
      { id: "a", correct: true },
      { id: "b", correct: false },
      { id: "c", correct: false },
    ];
    const snapshot = structuredClone(original);

    const shuffled = shuffle(original);

    expect(original).toEqual(snapshot);
    expect(shuffled).not.toBe(original);
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.map((x) => x.id).sort()).toEqual(["a", "b", "c"]);
  });

  it("в диалогах жителей (PATROL_NPCS) после shuffle ровно один верный вариант, находится по полю correct", () => {
    for (const npc of PATROL_NPCS) {
      const expectedCorrectText = npc.options.find((opt) => opt.correct)?.text.ru;
      for (let run = 0; run < 20; run += 1) {
        const shuffled = shuffle(npc.options);
        const correctItems = shuffled.filter((opt) => opt.correct);
        expect(correctItems).toHaveLength(1);
        expect(correctItems[0]?.text.ru).toBe(expectedCorrectText);
      }
    }
  });

  it("в кейсах SMS (DELIVERY_SMS_CASES) после shuffle ровно один верный вариант, находится по id и correct", () => {
    for (const smsCase of DELIVERY_SMS_CASES) {
      const expectedCorrectId = smsCase.options.find((opt) => opt.correct)?.id;
      for (let run = 0; run < 20; run += 1) {
        const shuffled = shuffle(smsCase.options);
        const correctItems = shuffled.filter((opt) => opt.correct);
        expect(correctItems).toHaveLength(1);
        expect(correctItems[0]?.id).toBe(expectedCorrectId);
      }
    }
  });

  it("в FakeCallScene (щиты этапа 2 и карты этапа 4) после shuffle ровно один верный вариант по полю", () => {
    for (const wave of FAKE_CALL_WAVES) {
      const shieldItems = FAKE_CALL_STAGES_META.ru.stage2Shields.map((title, idx) => ({
        id: `shield-${idx}`,
        title,
        isCorrect: idx === wave.correctShieldIndex,
      }));
      const expectedId = `shield-${wave.correctShieldIndex}`;

      for (let run = 0; run < 20; run += 1) {
        const shuffled = shuffle(shieldItems);
        const correctItems = shuffled.filter((item) => item.isCorrect);
        expect(correctItems).toHaveLength(1);
        expect(correctItems[0]?.id).toBe(expectedId);
      }
    }

    for (const round of FAKE_CALL_DUEL_ROUNDS) {
      const expectedId = round.cards.find((card) => card.correct)?.id;
      for (let run = 0; run < 20; run += 1) {
        const shuffled = shuffle(round.cards);
        const correctItems = shuffled.filter((card) => card.correct);
        expect(correctItems).toHaveLength(1);
        expect(correctItems[0]?.id).toBe(expectedId);
      }
    }
  });

  it("в HackedAccountScene (барьеры этапа 2 и карты этапа 4) после shuffle ровно один верный вариант по полю", () => {
    for (const trap of HACKED_LOGIN_TRAPS) {
      const blockerItems = HACKED_ACCOUNT_META.ru.stage2Blockers.map((label, idx) => ({
        id: `blocker-${idx}`,
        label,
        isCorrect: idx === trap.correctBlockerIndex,
      }));
      const expectedId = `blocker-${trap.correctBlockerIndex}`;

      for (let run = 0; run < 20; run += 1) {
        const shuffled = shuffle(blockerItems);
        const correctItems = shuffled.filter((item) => item.isCorrect);
        expect(correctItems).toHaveLength(1);
        expect(correctItems[0]?.id).toBe(expectedId);
      }
    }

    for (const round of HACKED_SHIELD_LAYERS) {
      const expectedId = round.cards.find((card) => card.correct)?.id;
      for (let run = 0; run < 20; run += 1) {
        const shuffled = shuffle(round.cards);
        const correctItems = shuffled.filter((card) => card.correct);
        expect(correctItems).toHaveLength(1);
        expect(correctItems[0]?.id).toBe(expectedId);
      }
    }

    for (const trap of BANK_PRESSURE_TRAPS) {
      const blockerItems = BANK_CALL_META.ru.stage2Blockers.map((label, idx) => ({
        id: `blocker-${idx}`,
        label,
        isCorrect: idx === trap.correctBlockerIndex,
      }));
      const expectedId = `blocker-${trap.correctBlockerIndex}`;

      for (let run = 0; run < 20; run += 1) {
        const shuffled = shuffle(blockerItems);
        const correctItems = shuffled.filter((item) => item.isCorrect);
        expect(correctItems).toHaveLength(1);
        expect(correctItems[0]?.id).toBe(expectedId);
      }
    }

    for (const round of BANK_DEFENSE_ROUNDS) {
      const expectedId = round.cards.find((card) => card.correct)?.id;
      for (let run = 0; run < 20; run += 1) {
        const shuffled = shuffle(round.cards);
        const correctItems = shuffled.filter((card) => card.correct);
        expect(correctItems).toHaveLength(1);
        expect(correctItems[0]?.id).toBe(expectedId);
      }
    }
  });

  it("в текстах ошибок нет ссылок на номер правильного щита или защиты", () => {
    for (const wave of FAKE_CALL_WAVES) {
      expect(wave.wrongFeedback.ru).not.toMatch(/Щит\s*[123]/i);
      expect(wave.wrongFeedback.ro).not.toMatch(/Scut(ul)?\s*[123]/i);
      expect(wave.wrongFeedback.ru).toContain(
        "Подумай: какая защита остановит именно эту уловку?",
      );
      expect(wave.wrongFeedback.ro).toContain(
        "Gândește-te: ce protecție oprește exact această capcană?",
      );
    }

    for (const trap of HACKED_LOGIN_TRAPS) {
      expect(trap.wrongFeedback.ru).not.toMatch(/Защита\s*[123]/i);
      expect(trap.wrongFeedback.ro).not.toMatch(/Măsura\s*[123]/i);
      expect(trap.wrongFeedback.ru).toContain(
        "Подумай: какая защита остановит именно эту уловку?",
      );
      expect(trap.wrongFeedback.ro).toContain(
        "Gândește-te: ce protecție oprește exact această capcană?",
      );
    }
  });
});
