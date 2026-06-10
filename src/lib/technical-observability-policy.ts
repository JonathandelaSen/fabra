type ObservabilityEnvironment = Partial<
  Pick<
    NodeJS.ProcessEnv,
    | "NODE_ENV"
    | "SENTRY_DSN"
    | "OBSERVABILITY_ENABLE_LOCAL"
    | "VITEST"
    | "VITEST_WORKER_ID"
  >
>;

export function isTechnicalObservabilityEnabled(
  env: ObservabilityEnvironment,
): boolean {
  if (!env.SENTRY_DSN) return false;
  if (
    env.NODE_ENV === "test" ||
    env.VITEST === "true" ||
    env.VITEST_WORKER_ID !== undefined
  ) {
    return false;
  }
  if (env.NODE_ENV === "production") return true;
  return (
    env.NODE_ENV === "development" &&
    env.OBSERVABILITY_ENABLE_LOCAL === "true"
  );
}

export function parseTechnicalObservabilitySampleRate(
  value: string | undefined,
): number {
  const parsed = Number(value ?? "1");
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 1;
}
