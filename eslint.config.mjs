import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noHardcodedStringContracts from "./eslint-rules/no-hardcoded-string-contracts.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      local: {
        rules: {
          "no-hardcoded-string-contracts": noHardcodedStringContracts,
        },
      },
    },
    rules: {
      "no-unused-vars": "off",
      "local/no-hardcoded-string-contracts": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    }
  },
  {
    files: ["**/*.test.*", "**/*.spec.*"],
    rules: {
      "local/no-hardcoded-string-contracts": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    ".test-infra/**",
    "test-results/**",
    "playwright-report/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
]);

export default eslintConfig;
