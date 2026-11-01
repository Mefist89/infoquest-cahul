import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    server: { deps: { inline: ["next-intl"] } },
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
