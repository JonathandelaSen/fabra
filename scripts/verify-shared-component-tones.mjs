import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const root = process.cwd();

// ── Rule 1: tone prop must use constants, never string literals ──────────────

const TONE_COMPONENTS = [
  { name: "AlertBanner", constants: "ALERT_BANNER_TONES" },
  { name: "LabelBadge", constants: "LABEL_BADGE_TONES" },
  { name: "IconTextButton", constants: "ICON_TEXT_BUTTON_TONES" },
  { name: "IconBox", constants: "ICON_BOX_TONES" },
];

// ── Rule 2: className on AlertBanner only allows safe utility prefixes ───────

const ALERT_BANNER_ALLOWED_CLASS_PREFIXES = [
  "m-", "mx-", "my-", "mt-", "mr-", "mb-", "ml-",
  "h-", "min-h-", "max-h-",
  "uppercase", "lowercase", "capitalize",
];

function listTsxFiles() {
  const result = spawnSync("rg", ["--files", "-g", "*.tsx", "src/"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0 && !result.stdout.trim()) return [];
  return result.stdout.split("\n").map((l) => l.trim()).filter(Boolean);
}

function findToneLiteralViolations(files) {
  const errors = [];
  const toneLiteralPattern = /tone="[^"]+"/g;

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const lines = source.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.matchAll(toneLiteralPattern);
      for (const match of matches) {
        const component = TONE_COMPONENTS.find((c) => {
          for (let j = i; j >= Math.max(0, i - 5); j--) {
            if (lines[j].includes(`<${c.name}`)) return true;
          }
          return false;
        });

        if (component) {
          errors.push(
            `${file}:${i + 1}: ${match[0]} → use ${component.constants}.* instead of string literal`
          );
        }
      }
    }
  }
  return errors;
}

function isClassAllowed(cls) {
  return ALERT_BANNER_ALLOWED_CLASS_PREFIXES.some(
    (prefix) => cls === prefix || cls.startsWith(prefix)
  );
}

function findAlertBannerClassNameViolations(files) {
  const errors = [];
  const classNamePattern = /className="([^"]+)"/g;
  const classNameExprPattern = /className=\{`([^`]+)`\}/g;

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const lines = source.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      let isAlertBannerLine = false;
      for (let j = i; j >= Math.max(0, i - 5); j--) {
        if (lines[j].includes("<AlertBanner")) {
          isAlertBannerLine = true;
          break;
        }
        if (lines[j].includes(">") && !lines[j].includes("<AlertBanner")) break;
      }
      if (!isAlertBannerLine) continue;

      for (const pattern of [classNamePattern, classNameExprPattern]) {
        pattern.lastIndex = 0;
        for (const match of line.matchAll(pattern)) {
          const rawClasses = match[1]
            .replace(/\$\{[^}]+\}/g, "")
            .trim();
          const classes = rawClasses.split(/\s+/).filter(Boolean);
          const bad = classes.filter((cls) => !isClassAllowed(cls));
          if (bad.length > 0) {
            errors.push(
              `${file}:${i + 1}: AlertBanner className contains disallowed utilities: ${bad.join(", ")}. Only margin (m-), height (h-), and text-transform (uppercase/lowercase/capitalize) utilities are allowed.`
            );
          }
        }
      }
    }
  }
  return errors;
}

const files = listTsxFiles();

const toneErrors = findToneLiteralViolations(files);
const classNameErrors = findAlertBannerClassNameViolations(files);
const allErrors = [...toneErrors, ...classNameErrors];

if (allErrors.length > 0) {
  console.error("verify-shared-component-tones FAILED:\n");
  for (const err of allErrors) {
    console.error(`  ✗ ${err}`);
  }
  console.error(`\n${allErrors.length} violation(s) found.`);
  process.exitCode = 1;
} else {
  console.log("verify-shared-component-tones: ok");
}
