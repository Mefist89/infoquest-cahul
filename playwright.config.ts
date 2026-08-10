import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const port = 3100;
const authStatePath = resolve("tests/.auth/google-user.json");
const hasAuthenticatedState = existsSync(authStatePath);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-public",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/full-journey.spec.ts",
    },
    ...(hasAuthenticatedState
      ? [{
          name: "chromium-authenticated",
          use: { ...devices["Desktop Chrome"], storageState: authStatePath },
          testMatch: "**/authenticated-journey.spec.ts",
        }]
      : []),
  ],
  webServer: {
    command: process.env.CI ? `npm run start -- -p ${port}` : `npm run dev -- -p ${port}`,
    url: `http://localhost:${port}/ru`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
