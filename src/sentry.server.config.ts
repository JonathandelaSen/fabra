import * as Sentry from "@sentry/nextjs";
import {
  isTechnicalObservabilityEnabled,
  parseTechnicalObservabilitySampleRate,
} from "@/lib/technical-observability-policy";

const enabled = isTechnicalObservabilityEnabled(process.env);

if (enabled) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled,
    environment:
      process.env.NODE_ENV === "production" ? "production" : "local",
    tracesSampleRate: parseTechnicalObservabilitySampleRate(
      process.env.SENTRY_TRACES_SAMPLE_RATE,
    ),
  });
}
