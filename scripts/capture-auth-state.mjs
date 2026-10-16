import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

import { chromium } from "@playwright/test";

const port = 3000;
const baseUrl = `http://localhost:${port}`;
const statePath = resolve("tests/.auth/google-user.json");
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";

async function waitForServer() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/ru/login`);
      if (response.ok) return;
    } catch {
      // The development server is still starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
  }
  throw new Error("InfoQuest did not start within 120 seconds.");
}

const server = spawn(npmCommand, ["run", "dev", "--", "-p", String(port)], {
  cwd: process.cwd(),
  stdio: "ignore",
  // .cmd shims on Windows require a shell, otherwise Node 24+ throws EINVAL.
  shell: isWindows,
});

try {
  await waitForServer();
  await mkdir(dirname(statePath), { recursive: true });

  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: false });
  } catch {
    browser = await chromium.launch({ headless: false });
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${baseUrl}/ru/login`);

  process.stdout.write("В открывшемся окне войдите отдельным тестовым Google-аккаунтом. Ожидаю страницу профиля...\n");
  await page.waitForURL(/\/ru\/profile(?:\?.*)?$/u, { timeout: 300_000 });
  await context.storageState({ path: statePath });
  await browser.close();

  process.stdout.write(`Сессия сохранена в ${statePath}\n`);
  process.stdout.write("Файл содержит секретную сессию и уже исключён из Git.\n");
} finally {
  if (isWindows && server.pid !== undefined) {
    // With shell:true server.kill() only stops the cmd wrapper,
    // so terminate the whole process tree to avoid an orphaned dev server.
    spawn("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    server.kill();
  }
}
