import type { Telemetry } from "@/modules/shared";
import { NoOpTelemetry, SentryTelemetry } from "@/modules/shared";
import { isTechnicalObservabilityEnabled } from "@/lib/technical-observability-policy";

export {
  isTechnicalObservabilityEnabled,
  parseTechnicalObservabilitySampleRate,
} from "@/lib/technical-observability-policy";

export const telemetry: Telemetry = isTechnicalObservabilityEnabled(process.env)
  ? new SentryTelemetry()
  : new NoOpTelemetry();
