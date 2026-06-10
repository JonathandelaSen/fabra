import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { isTechnicalObservabilityEnabled } from "./src/lib/technical-observability-policy";

const observabilityEnabled = isTechnicalObservabilityEnabled(process.env);
const sourceMapUploadEnabled =
  process.env.NODE_ENV === "production" &&
  Boolean(
    process.env.SENTRY_AUTH_TOKEN &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT,
  );

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.130", "192.168.1.129"],
  serverExternalPackages: ["@napi-rs/canvas", "pdf-parse"],
  outputFileTracingIncludes: {
    "/api/**/*": [
      "./node_modules/@napi-rs/canvas/**/*",
      "./node_modules/pdf-parse/**/*",
      "./node_modules/pdfjs-dist/**/*",
    ],
  },
  env: {
    FABRA_PUBLIC_OBSERVABILITY_ENABLED: String(observabilityEnabled),
    FABRA_PUBLIC_SENTRY_DSN: observabilityEnabled
      ? process.env.SENTRY_DSN ?? ""
      : "",
    FABRA_PUBLIC_SENTRY_TRACES_SAMPLE_RATE:
      process.env.SENTRY_TRACES_SAMPLE_RATE ?? "1",
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  sourcemaps: {
    disable: !sourceMapUploadEnabled,
  },
  errorHandler(error) {
    console.warn("Sentry build integration failed.", error);
  },
});
