import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const approvedSentryImports = new Set([
  "next.config.ts",
  "scripts/verify-technical-observability-boundaries.mjs",
  "src/app/global-error.tsx",
  "src/instrumentation-client.ts",
  "src/instrumentation.ts",
  "src/modules/shared/infrastructure/telemetry/sentry-telemetry.test.ts",
  "src/modules/shared/infrastructure/telemetry/sentry-telemetry.ts",
  "src/sentry.edge.config.ts",
  "src/sentry.server.config.ts",
]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git" ||
      entry.name === ".test-infra"
    ) {
      return [];
    }
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

const sourceFiles = walk(root).filter((file) => /\.(?:ts|tsx|mjs)$/.test(file));
const failures = [];

for (const file of sourceFiles) {
  const relative = path.relative(root, file);
  const source = fs.readFileSync(file, "utf8");

  if (
    source.includes("@sentry/nextjs") &&
    !approvedSentryImports.has(relative)
  ) {
    failures.push(`${relative}: imports @sentry/nextjs outside the allowlist`);
  }

  if (
    /src\/modules\/[^/]+\/application\/use-cases\/.+\.use-case\.ts$/.test(
      relative,
    ) &&
    /(SentryTelemetry|captureException|telemetry\.trace)/.test(source)
  ) {
    failures.push(`${relative}: use cases must not perform technical telemetry`);
  }

  if (
    /src\/app\/api\/.+\/route\.ts$/.test(relative) &&
    source.includes("SentryTelemetry")
  ) {
    failures.push(`${relative}: API routes must use configured telemetry`);
  }
}

const eventBusSource = fs.readFileSync(
  path.join(
    root,
    "src/modules/shared/infrastructure/bus/event-bus/in-memory-event-bus.ts",
  ),
  "utf8",
);
if (eventBusSource.includes("toPrimitives(")) {
  failures.push(
    "InMemoryEventBus must not attach domain event payload primitives to telemetry",
  );
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Technical observability boundaries verified.");
}
