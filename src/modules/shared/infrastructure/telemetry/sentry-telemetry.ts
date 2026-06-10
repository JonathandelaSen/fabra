import * as Sentry from "@sentry/nextjs";
import type {
  Telemetry,
  TelemetryCaptureOptions,
  TelemetryLogOptions,
  TelemetrySpanOptions,
  TelemetryUser,
} from "../../application/telemetry/telemetry";

type OperationOutcome<T> =
  | { ok: true; value: T }
  | { ok: false; error: unknown };

function warnTelemetryFailure(operation: string, error: unknown): void {
  console.warn(`Technical telemetry ${operation} failed.`, error);
}

export class SentryTelemetry implements Telemetry {
  async trace<T>(
    options: TelemetrySpanOptions,
    operation: () => Promise<T>,
  ): Promise<T> {
    let operationStarted = false;
    let outcome: OperationOutcome<T> | undefined;

    const runOnce = async (): Promise<OperationOutcome<T>> => {
      if (operationStarted) {
        if (!outcome) {
          throw new Error("Telemetry operation is already running.");
        }
        return outcome;
      }

      operationStarted = true;
      try {
        outcome = { ok: true, value: await operation() };
      } catch (error) {
        outcome = { ok: false, error };
      }
      return outcome;
    };

    try {
      await Sentry.startSpan(
        {
          name: options.name,
          op: options.operation,
          attributes: options.attributes,
        },
        async (span) => {
          const result = await runOnce();
          if (!result.ok) {
            span.setStatus({ code: 2, message: "internal_error" });
          }
        },
      );
    } catch (telemetryError) {
      warnTelemetryFailure("trace", telemetryError);
      if (!operationStarted) {
        await runOnce();
      }
    }

    if (!outcome) {
      throw new Error("Telemetry failed to execute the wrapped operation.");
    }
    if (!outcome.ok) throw outcome.error;
    return outcome.value;
  }

  log(options: TelemetryLogOptions): void {
    try {
      Sentry.logger[options.level](options.message, options.attributes);
    } catch (telemetryError) {
      warnTelemetryFailure("log", telemetryError);
    }
  }

  captureException(error: unknown, options?: TelemetryCaptureOptions): void {
    try {
      Sentry.withScope((scope) => {
        if (options?.attributes) scope.setAttributes(options.attributes);
        Sentry.captureException(error);
      });
    } catch (telemetryError) {
      warnTelemetryFailure("captureException", telemetryError);
    }
  }

  setUser(user: TelemetryUser | null): void {
    try {
      Sentry.setUser(user);
    } catch (telemetryError) {
      warnTelemetryFailure("setUser", telemetryError);
    }
  }
}
