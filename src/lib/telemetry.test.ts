import { describe, expect, it } from "vitest";
import { isTechnicalObservabilityEnabled } from "./telemetry";

describe("isTechnicalObservabilityEnabled", () => {
  it.each([
    [{ NODE_ENV: "production", SENTRY_DSN: "dsn" }, true],
    [{ NODE_ENV: "production" }, false],
    [
      {
        NODE_ENV: "development",
        SENTRY_DSN: "dsn",
        OBSERVABILITY_ENABLE_LOCAL: "true",
      },
      true,
    ],
    [{ NODE_ENV: "development", SENTRY_DSN: "dsn" }, false],
    [
      {
        NODE_ENV: "development",
        SENTRY_DSN: "dsn",
        OBSERVABILITY_ENABLE_LOCAL: "TRUE",
      },
      false,
    ],
    [
      {
        NODE_ENV: "test",
        SENTRY_DSN: "dsn",
        OBSERVABILITY_ENABLE_LOCAL: "true",
      },
      false,
    ],
  ] as const)("returns %s for %o", (env, expected) => {
    expect(isTechnicalObservabilityEnabled(env)).toBe(expected);
  });
});
