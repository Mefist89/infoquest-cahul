import { describe, expect, it } from "vitest";
import { SAFETY_PHRASES } from "@/data/safety-phrases";
import { operatorCallContent } from "@/data/operator-call";
import { fakeLinkContent } from "@/data/fake-link";
import { hackedAccountContent } from "@/data/hacked-account";
import { PATROL_NPCS } from "@/data/patrol";
import { FAKE_CALL_DUEL_ROUNDS, FAKE_CALL_SWITCH_NODES } from "@/data/patrol-fake-call";
import { DELIVERY_SMS_THEORY, DELIVERY_SMS_UI } from "@/data/patrol-delivery-sms";
import { HACKED_LOGIN_TRAPS } from "@/data/patrol-hacked-account";
import { scamOrRealContent } from "@/data/scam-or-real";
import { chronoContent } from "@/data/chrono-content";
import { legalContent } from "@/data/legal-content";

describe("утверждённые правила безопасности", () => {
  it("сохраняет обе пары фраз дословно", () => {
    expect(SAFETY_PHRASES).toEqual({
      ru: {
        bankCall: "Положи трубку и сам позвони в банк по номеру на обороте карты или с официального сайта.",
        smsCode: "Код из SMS вводишь только ты сам — на сайте или в приложении, которые открыл сам. Кто просит назвать или переслать код — мошенник.",
      },
      ro: {
        bankCall: "Închide și sună tu la bancă, la numărul de pe spatele cardului sau de pe site-ul oficial.",
        smsCode: "Codul din SMS îl introduci doar tu, pe site-ul sau în aplicația pe care le-ai deschis singur. Cine îți cere să-i spui sau să-i trimiți codul este un escroc.",
      },
    });
  });

  it.each(["ru", "ro"] as const)("%s: банковские сценарии используют одинаковые слова", locale => {
    const bank = SAFETY_PHRASES[locale].bankCall;
    const hacked = hackedAccountContent[locale].shadowBattle.questions.find(item => item.id === "q-call")!;
    expect(hacked.options.find(option => option.id === "hangup")!.text).toBe(bank);
    expect(hacked.explain).toContain(bank);
    const link = fakeLinkContent[locale].finalBattle.questions.find(item => item.id === "q-react-bank")!;
    expect(link.options.find(option => option.id === "hangup")!.text).toBe(bank);
    const patrol = PATROL_NPCS.find(npc => npc.id === "bank-operator")!;
    expect(patrol.options.find(option => option.correct)!.text[locale]).toBe(bank);
    expect(patrol.fail[locale]).toContain(bank);
    const boss = operatorCallContent[locale].final.phase3.find(item => item.id === "p3_9")!;
    expect(boss.options[2]).toBe(bank);
    expect(boss.explain).toContain(bank);
    expect(boss.answers).toEqual([0, 2]);
  });

  it.each(["ru", "ro"] as const)("%s: правило SMS совпадает в модулях и Патруле", locale => {
    const sms = SAFETY_PHRASES[locale].smsCode;
    expect(operatorCallContent[locale].intro.lines).toContain(sms);
    expect(hackedAccountContent[locale].theory.cards.at(-1)!.text).toContain(sms);
    expect(fakeLinkContent[locale].finalBattle.questions.find(item => item.id === "q-boss")!.explain).toContain(sms);
    expect(PATROL_NPCS.find(npc => npc.id === "bank-operator")!.success[locale]).toContain(sms);
    expect(DELIVERY_SMS_THEORY.rules.find(rule => rule.id === "card-cvv")!.description[locale]).toBe(sms);
    expect(DELIVERY_SMS_UI[locale].summaryChecklist).toContain(sms);
    expect(HACKED_LOGIN_TRAPS.find(trap => trap.id === "trap-3")!.successFeedback[locale]).toContain(sms);
    expect(FAKE_CALL_DUEL_ROUNDS.flatMap(round => round.cards).find(card => card.id === "c2-code")!.feedback[locale]).toContain(sms);
  });

  it("сохраняет небезопасный перезвон как неверный пример", () => {
    const callback = FAKE_CALL_SWITCH_NODES.find(node => node.id === "node-callback")!;
    expect(callback.unsafeState.ru).toContain("Перезвонить в тот же подозрительный чат");
    expect(callback.safeState.ru).toContain("проверенный номер друга");
  });

  it.each(["ru", "ro"] as const)("%s: оставшиеся советы используют полное правило SMS", locale => {
    const sms = SAFETY_PHRASES[locale].smsCode;
    const operator = operatorCallContent[locale];
    for (const id of ["c3", "c5", "c11"]) {
      expect(operator.classify.items.find(item => item.id === id)!.explain).toContain(sms);
    }
    expect(operator.ordering.levels[0].steps.find(step => step.id === "s2")!.text).toBe(sms);
    expect(operator.final.phase2.find(item => item.id === "p2_10")!.explain).toContain(sms);
    expect(operator.final.phase3.find(item => item.id === "p3_6")!.explain).toContain(sms);

    const scam = scamOrRealContent[locale];
    const code = scam.haggleDialogue.steps.find(step => step.id === "code")!;
    expect(code.options.find(option => option.id === "refuse")!.text).toBe(sms);
    expect(code.options.find(option => option.id === "send-code")!.correct).toBe(false);
    const finalCode = scam.shopBattle.questions.find(question => question.id === "q-code")!;
    expect(finalCode.options.find(option => option.id === "refuse")!.text).toBe(sms);
    expect(finalCode.options.find(option => option.id === "send-code")!.correct).toBe(false);
    expect(scam.haggleDialogue.steps.find(step => step.id === "deal")!.correction).toContain(sms);
  });

  it.each(["ru", "ro"] as const)("%s: Chrono и юридические тексты не делают исключения для SMS-кодов", locale => {
    const sms = SAFETY_PHRASES[locale].smsCode;
    expect(chronoContent[locale].privacyNotice).toContain(sms);
    expect(chronoContent[locale].chatPrivacyNotice).toContain(sms);
    for (const kind of ["privacy", "terms"] as const) {
      const sections = legalContent[locale][kind].sections;
      expect(JSON.stringify(sections)).toContain(sms);
    }
  });
});
