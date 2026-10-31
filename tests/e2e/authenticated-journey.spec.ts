import { expect, test } from "@playwright/test";

test.describe("авторизованный путь Google-пользователя", () => {
  test("сохранённая Google-сессия открывает профиль", async ({ page }) => {
    await page.goto("/ru/profile");

    await expect(page).toHaveURL(/\/ru\/profile$/u);
    await expect(page.getByRole("button", { name: "Выйти" })).toBeVisible();
  });

  for (const locale of ["ru", "ro"] as const) {
    for (const section of ["", "/missions", "/achievements", "/quests"] as const) {
      test(`кабинет /${locale}/profile${section} помещается в 390px`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        const path = `/${locale}/profile${section}`;
        await page.goto(path);

        await expect(page).toHaveURL(path);
        const header = page.locator("header");
        await expect(header.getByRole("button")).toBeInViewport({ ratio: 1 });
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
