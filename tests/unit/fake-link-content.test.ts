import { describe, expect, it } from "vitest";
import { fakeLinkContent } from "@/data/fake-link";

const { ru, ro } = fakeLinkContent;
const correctDialogue = { "parcel-sms": ["check"], "bank-call": ["callback"], "friend-loan": ["verify"], "prize-win": ["ignore"] };
const correctFinal = { "q-link": ["phishing"], "q-react": ["calm"], "q-link-safe": ["safe"], "q-react-bank": ["hangup"], "q-boss": ["block", "delete"] };

describe("контент fake-link: сохранение ID и правильных ответов", () => {
  it.each(["ru", "ro"] as const)("%s: совет перезвонить указывает номер на обороте карты", locale => {
    const content = fakeLinkContent[locale];
    const strings = (value: unknown): string[] => typeof value === "string"
      ? [value]
      : value && typeof value === "object" ? Object.values(value).flatMap(strings) : [];
    const callbacks = strings(content).filter(text => /перезвон|sun\s+înapoi/i.test(text));
    expect(callbacks.length).toBeGreaterThan(0);
    for (const text of callbacks) {
      expect(text).toContain(locale === "ru" ? "по номеру на обороте карты" : "numărul de pe spatele cardului");
    }
    const form = content.findSignals.signals.find(signal => signal.id === "form")!;
    expect(form.explain).not.toMatch(/нужны только логин и пароль|trebuie doar login și parolă/);
    expect(form.explain).toContain("SMS");
  });

  it.each(["ru", "ro"] as const)("%s: источник ссылки не подсказывает её вердикт", locale => {
    const items = fakeLinkContent[locale].linkClassify.items;
    const smsItems = items.filter(item => /SMS/.test(item.context));
    expect(smsItems.some(item => item.verdict === "safe")).toBe(true);
    expect(smsItems.some(item => item.verdict === "phishing")).toBe(true);
    const searchItem = items.find(item => item.id === "search-fake")!;
    expect(searchItem.context).toMatch(/поиск|căutări/);
    expect(searchItem.verdict).toBe("phishing");
  });

  it.each(["ru", "ro"] as const)("%s: ровно пять шагов с прежними ID", locale => {
    const steps = fakeLinkContent[locale].orderSteps.steps;
    expect(steps).toHaveLength(5);
    expect(steps.map(step => step.id)).toEqual(["stop", "domain", "lock", "manual", "report"]);
    expect(new Set(steps.map(step => step.id)).size).toBe(5);
    expect(steps.find(step => step.id === "domain")!.text).toContain("banca-noroc.md.secure.top");
  });

  it.each(["ru", "ro"] as const)("%s: сохраняет шесть сигналов и их ID", locale => {
    expect(fakeLinkContent[locale].findSignals.signals.map(item => item.id)).toEqual(["domain", "no-https", "urgency", "logo", "form", "prize"]);
  });

  it.each(["ru", "ro"] as const)("%s: HTTPS встречается и у фишинговых адресов", locale => {
    const items = fakeLinkContent[locale].linkClassify.items;
    expect(Object.fromEntries(items.map(item => [item.id, item.verdict]))).toEqual({
      "bank-official": "safe", "bank-fake": "phishing", "posta-official": "safe",
      "posta-fake": "phishing", "search-official": "safe", "search-fake": "phishing",
    });
    expect(items.filter(item => new URL(item.url).protocol === "https:" && item.verdict === "phishing").map(item => item.id)).toEqual(["posta-fake", "search-fake"]);
  });

  it.each(["ru", "ro"] as const)("%s: диалоги сохраняют утверждённые правильные реакции", locale => {
    expect(Object.fromEntries(fakeLinkContent[locale].dialogueReact.scenarios.map(question => [question.id, question.options.filter(option => option.correct).map(option => option.id)]))).toEqual(correctDialogue);
  });

  it.each(["ru", "ro"] as const)("%s: финал сохраняет правильные ответы и требует block вместе с delete", locale => {
    expect(Object.fromEntries(fakeLinkContent[locale].finalBattle.questions.map(question => [question.id, question.options.filter(option => option.correct).map(option => option.id)]))).toEqual(correctFinal);
    expect(fakeLinkContent[locale].finalBattle.questions.find(question => question.id === "q-boss")!.multi).toBe(true);
  });

  it("RU и RO совпадают по ID вариантов, числу вариантов и правильным ответам", () => {
    const structure = (questions: readonly { id: string; options: readonly { id: string; correct: boolean }[] }[]) => questions.map(question => ({ id: question.id, options: question.options.map(option => ({ id: option.id, correct: option.correct })) }));
    expect(structure(ro.dialogueReact.scenarios)).toEqual(structure(ru.dialogueReact.scenarios));
    expect(structure(ro.finalBattle.questions)).toEqual(structure(ru.finalBattle.questions));
  });
});
