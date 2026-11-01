import { expect, test } from "@playwright/test";

test.describe("публичный путь пользователя", () => {
  test("русская главная ведёт на отдельную страницу входа", async ({ page }) => {
    await page.goto("/ru");

    await expect(page.getByRole("heading", { level: 1, name: "InfoQuest" })).toBeVisible();
    const start = page.getByRole("link", { name: "Начать расследование" });
    await expect(start).toHaveAttribute("href", "/ru/login");
    await start.click();

    await expect(page).toHaveURL(/\/ru\/login$/u);
    await expect(page.getByRole("button", { name: "Продолжить с Google" })).toBeVisible();
  });

  test("румынская версия и юридические страницы открываются", async ({ page }) => {
    await page.goto("/ro");

    await expect(page.getByRole("heading", { level: 1, name: "InfoQuest" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Începe investigația" })).toHaveAttribute("href", "/ro/login");

    await page.goto("/ro/privacy");
    await expect(page.getByRole("heading", { level: 1, name: "Politica de confidențialitate" })).toBeVisible();
    await page.goto("/ru/terms");
    await expect(page.getByRole("heading", { level: 1, name: "Условия использования" })).toBeVisible();
  });

  test("защищённый профиль перенаправляет гостя на вход", async ({ page }) => {
    await page.goto("/ru/profile");
    await expect(page).toHaveURL(/\/ru\/login$/u);
  });
});

for (const locale of ["ru", "ro"] as const) {
  test(`${locale}: меню главной доступно на телефоне, A+ сохраняет выбор`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    const menuLabel = locale === "ru" ? "Меню" : "Meniu";
    const textLabel = locale === "ru" ? "Крупный текст" : "Text mărit";
    const navigationLabel = locale === "ru" ? "Главная навигация" : "Navigare principală";
    const menu = page.getByRole("button", { name: menuLabel, exact: true });

    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await menu.click();
    const nav = page.getByRole("navigation", { name: navigationLabel, exact: true });
    await expect(nav.getByRole("link")).toHaveCount(5);
    for (const href of ["#how", "#missions", "#badges", "#materials", "#about"]) {
      await expect(nav.locator(`a[href="${href}"]`)).toBeVisible();
      await expect(page.locator(href)).toHaveCount(1);
    }
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();

    await menu.click();
    await nav.locator('a[href="#how"]').click();
    await expect(page).toHaveURL(new RegExp(`/${locale}#how$`));
    await expect(menu).toHaveAttribute("aria-expanded", "false");

    await menu.click();
    await page.getByRole("button", { name: textLabel, exact: true }).click();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();
    await expect(page.locator("html")).toHaveCSS("font-size", "20px");
    await menu.click();
    await expect(page.getByRole("button", { name: textLabel, exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.mouse.click(2, 820);
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();
    await page.reload();
    await expect(page.locator("html")).toHaveCSS("font-size", "20px");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

    for (const width of [1280, 1366]) {
      await page.setViewportSize({ width, height: 844 });
      await expect(menu).toBeHidden();
      await expect(page.getByRole("navigation", { name: navigationLabel, exact: true }).getByRole("link")).toHaveCount(5);
      await expect(page.getByRole("button", { name: textLabel, exact: true })).toHaveCount(1);
    }
    await page.getByRole("button", { name: textLabel, exact: true }).click();
    await expect(page.locator("html")).toHaveCSS("font-size", "16px");

    await page.getByRole("button", { name: textLabel, exact: true }).click();
    await expect(page.locator("html")).toHaveCSS("font-size", "20px");
    await page.locator(`a[href="/${locale}/privacy"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/privacy$`));
    await expect(page.locator("html")).toHaveCSS("font-size", "16px");
  });

  test(`${locale}: гостевая панель содержит все переходы на 390 и 1024px`, async ({ page }) => {
    for (const width of [390, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}`);
      const menu = page.getByRole("button", { name: locale === "ru" ? "Меню" : "Meniu", exact: true });
      await expect(menu).toBeVisible();
      const menuBox = await menu.boundingBox();
      expect(menuBox!.width).toBeGreaterThanOrEqual(44);
      expect(menuBox!.height).toBeGreaterThanOrEqual(44);
      await menu.click();
      const panel = page.getByTestId("home-menu-panel");
      const links = panel.getByRole("navigation").getByRole("link");
      await expect(links).toHaveCount(5);
      await expect(links.first()).toBeFocused();
      await expect(panel.getByRole("link", { name: locale === "ru" ? "Войти" : "Autentificare", exact: true })).toHaveAttribute("href", `/${locale}/login`);
      await expect(panel.getByRole("link", { name: "Chrono", exact: true })).toHaveAttribute("href", `/${locale}/login?next=${encodeURIComponent(`/${locale}/ai-help`)}`);
      await expect(panel.getByRole("group").getByRole("button")).toHaveCount(2);
      for (const link of await links.all()) {
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
        await expect(link).toHaveCSS("font-size", "16px");
      }
      await page.keyboard.press("Escape");
      await expect(menu).toBeFocused();
    }
  });

  test(`${locale}: широкое меню не пересекается со входом и языками`, async ({ page }) => {
    for (const width of [1366, 1920]) {
      await page.setViewportSize({ width, height: 1080 });
      await page.goto(`/${locale}`);
      const header = page.locator("header").first();
      const nav = header.getByTestId("home-desktop-nav");
      await expect(nav).toBeVisible();
      const login = header.getByRole("link", { name: locale === "ru" ? "Войти" : "Autentificare", exact: true });
      await expect(login).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const navBox = await nav.boundingBox();
      const loginBox = await login.boundingBox();
      const languageBox = await header.getByRole("group", { name: "Language", exact: true }).boundingBox();
      expect(navBox!.x + navBox!.width).toBeLessThanOrEqual(loginBox!.x);
      expect(navBox!.x + navBox!.width).toBeLessThanOrEqual(languageBox!.x);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });
}
