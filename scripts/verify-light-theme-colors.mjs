import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const root = process.cwd();

const SCAN_DIRS = ["src/features", "src/components", "src/app"];

const WHITELIST = [];

const COLOR_FAMILIES = [
  "slate", "gray", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime", "green", "emerald",
  "teal", "cyan", "sky", "blue", "indigo", "violet", "purple",
  "fuchsia", "pink", "rose",
];

const COLOR_PREFIXES = [
  "bg", "text", "border", "ring", "ring-offset", "from", "to", "via",
  "fill", "stroke", "divide", "outline", "decoration", "shadow",
  "accent", "caret", "placeholder",
];

const familyAlternation = COLOR_FAMILIES.join("|");
const prefixAlternation = COLOR_PREFIXES.join("|");

const familyPattern = new RegExp(
  `\\b(?:${prefixAlternation})-(?:${familyAlternation})-\\d{1,3}(?:\\/\\d{1,3})?\\b`
);

const whiteBlackPattern = new RegExp(
  `\\b(?:${prefixAlternation})-(?:white|black)(?:\\/\\d{1,3})?\\b`
);

const arbitraryHexPattern = new RegExp(
  `\\b(?:${prefixAlternation})-\\[#[0-9a-fA-F]{3,8}\\]`
);

function isWhitelisted(file) {
  return WHITELIST.some((entry) => file.includes(entry));
}

function listTsxFiles() {
  const result = spawnSync("rg", ["--files", "-g", "*.tsx", ...SCAN_DIRS], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0 && !result.stdout.trim()) return [];
  return result.stdout
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((f) => !f.endsWith(".test.tsx"));
}

function findViolations(files) {
  const errors = [];

  for (const file of files) {
    if (isWhitelisted(file)) continue;

    const source = readFileSync(file, "utf8");
    const lines = source.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hits = new Set();

      for (const pattern of [familyPattern, whiteBlackPattern, arbitraryHexPattern]) {
        const re = new RegExp(pattern.source, "g");
        for (const match of line.matchAll(re)) {
          hits.add(match[0]);
        }
      }

      if (hits.size > 0) {
        errors.push(
          `${file}:${i + 1}: literal color(s) ${[...hits].join(", ")} → use semantic tokens from globals.css`
        );
      }
    }
  }

  return errors;
}

const files = listTsxFiles();
const errors = findViolations(files);

if (errors.length > 0) {
  console.error("verify-light-theme-colors FAILED:\n");
  for (const err of errors) {
    console.error(`  ✗ ${err}`);
  }
  console.error(`\n${errors.length} literal-color violation(s) found.`);
  console.error(
    "Replace literal Tailwind colors with semantic tokens (see docs/design/screen-design-system.md → Color Tokens),"
  );
  console.error(
    "or add intentional carve-outs to the WHITELIST in scripts/verify-light-theme-colors.mjs."
  );
  process.exitCode = 1;
} else {
  console.log("verify-light-theme-colors: ok");
}
