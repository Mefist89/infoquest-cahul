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
