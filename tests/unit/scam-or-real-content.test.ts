import { describe, expect, it } from "vitest";
import { scamOrRealContent } from "@/data/scam-or-real";

describe("scam-or-real: согласованность данных RU и RO", () => {
  const { ru, ro } = scamOrRealContent;
  const structure = (questions: readonly { id: string; options: readonly { id: string; correct: boolean }[] }[]) =>
    questions.map(question => ({ id: question.id, options: question.options.map(option => ({ id: option.id, correct: option.correct })) }));

  it("диалог и финал совпадают по ID, числу вариантов и правильным ответам", () => {
    expect(structure(ro.haggleDialogue.steps)).toEqual(structure(ru.haggleDialogue.steps));
    expect(structure(ro.shopBattle.questions)).toEqual(structure(ru.shopBattle.questions));
  });

  it.each(["ru", "ro"] as const)("%s: после просьбы о коде верно прекратить общение, встреча неверна", locale => {
    const steps = scamOrRealContent[locale].haggleDialogue.steps;
    expect(steps.map(step => step.id)).toEqual(["prepay", "check", "secret", "code", "deal"]);
    const deal = steps.find(step => step.id === "deal")!;
    expect(deal.options.map(option => ({ id: option.id, correct: option.correct }))).toEqual([
      { id: "prepay-deal", correct: true }, { id: "safe-deal", correct: false }, { id: "never", correct: false },
    ]);
    expect(deal.options.find(option => option.correct)!.text).toMatch(/Прекращаю переписку|Opresc discuția/);
  });

  it.each(["ru", "ro"] as const)("%s: финал требует внешние отзывы, осмотр и самостоятельно открытый сайт сети", locale => {
    const boss = scamOrRealContent[locale].shopBattle.questions.find(question => question.id === "q-boss")!;
    expect(boss.multi).toBe(true);
    expect(boss.options.filter(option => option.correct).map(option => option.id)).toEqual(["address", "reviews", "return"]);
    expect(boss.options.find(option => option.id === "address")!.text).toMatch(/на других сайтах|pe alte site-uri/);
    expect(boss.options.find(option => option.id === "reviews")!.text).toMatch(/осмотрел товар|verificat marfa/);
    expect(boss.options.find(option => option.id === "return")!.text).toMatch(/открыл сам|deschis singur/);
    expect(boss.options.find(option => option.id === "timer")!.correct).toBe(false);
    expect(boss.options.find(option => option.id === "prepay")!.text).toMatch(/личную карту|card personal/);
  });

  it.each(["ru", "ro"] as const)("%s: пять шагов сохраняют ID, осмотр предшествует оплате", locale => {
    const content = scamOrRealContent[locale].sellerCheck;
    expect(content.steps).toHaveLength(5);
    expect(content.steps.map(step => step.id)).toEqual(["offer", "seller", "contacts", "payment", "doubt"]);
    expect(content.steps[2].text).toMatch(/после осмотра товара|după verificarea mărfii/);
    expect(content.steps[3].text).toMatch(/Получи товар и осмотри|Primește marfa și verific/);
    expect(content.steps[4].text).toMatch(/Только после этого плати|Abia după asta plătește/);
    expect(content.prompt).toMatch(/При сомнениях|La îndoieli/);
  });

  it("классификация сохраняет ID и вердикты в обоих языках", () => {
    const expected = { "phone-half": "scam", "shop-address": "honest", "prize-fee": "scam", "sale-10": "honest", "sms-code": "scam", "bike-meet": "honest" };
    for (const content of [ru, ro]) {
      expect(Object.fromEntries(content.offerClassify.items.map(item => [item.id, item.verdict]))).toEqual(expected);
      expect(content.dealSignals.signals.map(signal => signal.id)).toEqual(["price", "prepay", "seller", "urgency", "contacts", "photo"]);
    }
  });
});
