import type {
  Telemetry,
  TelemetryCaptureOptions,
  TelemetrySpanOptions,
  TelemetryUser,
} from "../../application/telemetry/telemetry";

export class NoOpTelemetry implements Telemetry {
  trace<T>(
    _options: TelemetrySpanOptions,
    operation: () => Promise<T>,
  ): Promise<T> {
    return operation();
  }

  captureException(
    _error: unknown,
    _options?: TelemetryCaptureOptions,
  ): void {}

  setUser(_user: TelemetryUser | null): void {}
}
