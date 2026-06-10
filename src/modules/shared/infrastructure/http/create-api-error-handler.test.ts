import { describe, expect, it, vi } from "vitest";
import type {
  Telemetry,
  TelemetryCaptureOptions,
} from "../../application/telemetry/telemetry";
import { DomainError } from "../../domain/errors/domain-error";
import { HttpError } from "./api-errors";
import { createApiErrorHandler } from "./create-api-error-handler";

class FakeTelemetry implements Telemetry {
  readonly captures: Array<{
    error: unknown;
    options?: TelemetryCaptureOptions;
  }> = [];
  shouldThrow = false;

  async trace<T>(_options: never, operation: () => Promise<T>): Promise<T> {
    return operation();
  }

  captureException(error: unknown, options?: TelemetryCaptureOptions): void {
    if (this.shouldThrow) throw new Error("provider failed");
    this.captures.push({ error, options });
  }

  setUser(): void {}
}

class ResourceNotFoundError extends DomainError {
  override name = "ResourceNotFoundError";
}
class InvalidResourceError extends DomainError {
  override name = "InvalidResourceError";
}

describe("createApiErrorHandler", () => {
  it.each([
    [new HttpError(409, "Conflict"), 409, "Conflict"],
    [new ResourceNotFoundError("Missing"), 404, "Missing"],
    [new InvalidResourceError("Invalid"), 400, "Invalid"],
    [new Error("Unexpected"), 500, "Internal server error"],
  ])("captures and maps errors", async (error, status, message) => {
    const telemetry = new FakeTelemetry();

    const response = createApiErrorHandler(telemetry)(error);

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ error: message });
    expect(telemetry.captures).toEqual([
      {
        error,
        options: {
          attributes: {
            "fabra.layer": "http",
            "fabra.error_type": error.name,
            "http.status_code": status,
          },
        },
      },
    ]);
  });

  it("preserves the response when telemetry capture fails", async () => {
    const telemetry = new FakeTelemetry();
    telemetry.shouldThrow = true;
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const response = createApiErrorHandler(telemetry)(
      new HttpError(403, "Forbidden"),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });
});
