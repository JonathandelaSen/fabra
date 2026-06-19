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
      "src/frontend/components/**/*.test.ts",
      "src/frontend/components/**/*.test.tsx",
      "src/frontend/features/**/*.test.ts",
      "src/frontend/features/**/*.test.tsx",
      "src/frontend/**/*.test.ts",
      "src/frontend/**/*.test.tsx",
    ],
    setupFiles: ["src/frontend/testing/setup.ts"],
  },
});
