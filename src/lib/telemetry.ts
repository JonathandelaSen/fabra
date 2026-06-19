import type { Telemetry } from "@/backend/modules/shared";
import { NoOpTelemetry, SentryTelemetry } from "@/backend/modules/shared";
import { isTechnicalObservabilityEnabled } from "@/lib/technical-observability-policy";

export {
  isTechnicalObservabilityEnabled,
  parseTechnicalObservabilitySampleRate,
} from "@/lib/technical-observability-policy";

export const telemetry: Telemetry = isTechnicalObservabilityEnabled(process.env)
  ? new SentryTelemetry()
  : new NoOpTelemetry();
