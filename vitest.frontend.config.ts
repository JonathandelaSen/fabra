import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
      },
    },
    include: [
      "src/components/**/*.test.ts",
      "src/components/**/*.test.tsx",
      "src/features/**/*.test.ts",
      "src/features/**/*.test.tsx",
      "src/frontend/**/*.test.ts",
      "src/frontend/**/*.test.tsx",
    ],
    setupFiles: ["src/frontend/testing/setup.ts"],
  },
});
