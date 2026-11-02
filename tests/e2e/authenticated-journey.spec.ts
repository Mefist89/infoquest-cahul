import { expect, test } from "@playwright/test";

test.describe("авторизованный путь Google-пользователя", () => {
  test("на телефоне «Наверх» не перекрывает отправку в Chrono", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ru/ai-help");
    await expect(page).toHaveURL(/\/ru\/ai-help$/u);
    await expect(page.getByRole("heading", { level: 2, name: /Онлайн-помощник/ })).toBeVisible();
    const consent = page.getByRole("button", { name: "Принять", exact: true });
    if (await consent.isVisible()) await consent.click();
    await page.getByRole("textbox", { name: "Вставьте подозрительное сообщение или опишите звонок…" }).fill("Мне звонят из банка и просят назвать код.");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await expect(page.getByRole("button", { name: "Наверх", exact: true })).toHaveCount(0);
    const send = page.getByRole("button", { name: "Отправить сообщение", exact: true });
    await expect(send).toBeEnabled();
    await send.click({ trial: true });
  });

  test("сохранённая Google-сессия открывает профиль", async ({ page }) => {
    await page.goto("/ru/profile");

    await expect(page).toHaveURL(/\/ru\/profile$/u);
    await expect(page.getByRole("button", { name: "Выйти" })).toBeVisible();
  });

  for (const locale of ["ru", "ro"] as const) {
    test(`${locale}: A+ работает в кабинете, модулях и Chrono на телефоне`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/${locale}/profile`);
      const label = locale === "ru" ? "Крупный текст" : "Text mărit";
      await page.getByRole("button", { name: label, exact: true }).filter({ visible: true }).click();
      for (const path of ["/profile", "/profile/missions", "/profile/achievements", "/profile/quests", "/modules/operator-call", "/modules/fake-link", "/modules/hacked-account", "/modules/scam-or-real", "/ai-help"]) {
        await page.goto(`/${locale}${path}`);
        await expect(page.locator("html")).toHaveCSS("font-size", "20px");
        await expect(page.getByRole("button", { name: label, exact: true }).filter({ visible: true })).toHaveAttribute("aria-pressed", "true");
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      }
      await page.getByRole("button", { name: label, exact: true }).filter({ visible: true }).click();
      await expect(page.locator("html")).toHaveCSS("font-size", "16px");
    });

    test(`${locale}: меню главной не пересекается с аккаунтом на широких экранах`, async ({ page }) => {
      for (const width of [1280, 1366, 1920]) {
        await page.setViewportSize({ width, height: 1080 });
        await page.goto(`/${locale}`);
        const nav = page.getByTestId("home-desktop-nav");
        const account = page.getByTestId("home-account");
        await expect(nav).toBeVisible();
        await expect(account).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const navBox = await nav.boundingBox();
        const accountBox = await account.boundingBox();
        expect(navBox!.x + navBox!.width).toBeLessThanOrEqual(accountBox!.x);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    });

    for (const section of ["", "/missions", "/achievements", "/quests"] as const) {
      test(`кабинет /${locale}/profile${section} помещается в 390px`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        const path = `/${locale}/profile${section}`;
        await page.goto(path);

        await expect(page).toHaveURL(path);
        const header = page.locator("header");
        await expect(header.getByRole("button", { name: locale === "ru" ? "Выйти" : "Ieșire", exact: true })).toBeInViewport({ ratio: 1 });
        await expect(header.getByRole("button", { name: locale === "ru" ? "Крупный текст" : "Text mărit", exact: true })).toBeInViewport({ ratio: 1 });
        await expect(header.getByRole("navigation", { name: "Language" })).toBeInViewport({ ratio: 1 });
        await page.evaluate(() => document.fonts.ready);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      });
    }
  }

  test("прохождение этапа сохраняется в Supabase и переживает перезагрузку", async ({ page }) => {
    await page.goto("/ru/modules/operator-call");
    await expect(page).toHaveURL(/\/ru\/modules\/operator-call$/u);

    const firstStage = page.getByTestId("stage-nav-1");
    await firstStage.click();

    const saveResponse = page.waitForResponse((response) =>
      response.request().method() === "POST"
      && response.url().includes("/rest/v1/rpc/complete_module_stage"),
    );
    await page.getByRole("button", { name: "Завершить этап" }).click();

    await expect((await saveResponse).ok()).toBe(true);
    await page.reload();
    await expect(page.getByTestId("stage-nav-1")).toHaveAttribute("aria-label", /Пройдено/u);
  });
});
