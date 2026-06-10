export type TelemetryAttribute = string | number | boolean;

export interface TelemetrySpanOptions {
  name: string;
  operation: string;
  attributes?: Record<string, TelemetryAttribute>;
}

export interface TelemetryCaptureOptions {
  attributes?: Record<string, TelemetryAttribute>;
}

export type TelemetryLogLevel = "debug" | "info" | "warn" | "error";

export interface TelemetryLogOptions {
  level: TelemetryLogLevel;
  message: string;
  attributes?: Record<string, TelemetryAttribute>;
}

export interface TelemetryUser {
  id: string;
}

export interface Telemetry {
  trace<T>(
    options: TelemetrySpanOptions,
    operation: () => Promise<T>,
  ): Promise<T>;
  log(options: TelemetryLogOptions): void;
  captureException(error: unknown, options?: TelemetryCaptureOptions): void;
  setUser(user: TelemetryUser | null): void;
}
