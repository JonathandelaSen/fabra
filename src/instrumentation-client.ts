import * as Sentry from "@sentry/nextjs";
import { parseTechnicalObservabilitySampleRate } from "@/lib/technical-observability-policy";

const enabled =
  process.env.FABRA_PUBLIC_OBSERVABILITY_ENABLED === "true" &&
  Boolean(process.env.FABRA_PUBLIC_SENTRY_DSN);

if (enabled) {
  Sentry.init({
    dsn: process.env.FABRA_PUBLIC_SENTRY_DSN,
    enabled,
    environment:
      process.env.NODE_ENV === "production" ? "production" : "local",
    enableLogs: true,
    tracesSampleRate: parseTechnicalObservabilitySampleRate(
      process.env.FABRA_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    ),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
