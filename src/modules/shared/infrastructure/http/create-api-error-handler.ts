import type { Telemetry } from "../../application/telemetry/telemetry";
import { getApiErrorStatus, mapApiErrorToResponse } from "./api-errors";

function getErrorType(error: unknown): string {
  return error instanceof Error ? error.name : typeof error;
}

export function createApiErrorHandler(telemetry: Telemetry) {
  return function handleApiError(error: unknown) {
    const status = getApiErrorStatus(error);

    try {
      telemetry.captureException(error, {
        attributes: {
          "fabra.layer": "http",
          "fabra.error_type": getErrorType(error),
          "http.status_code": status,
        },
      });
    } catch (telemetryError) {
      console.warn("Technical telemetry captureException failed.", telemetryError);
    }

    return mapApiErrorToResponse(error);
  };
}
