import { describe, expect, it, vi } from "vitest";
import type {
  Telemetry,
  TelemetrySpanOptions,
} from "../../application/telemetry/telemetry";
import { instrumentUseCases } from "./instrument-use-cases";

class FakeTelemetry implements Telemetry {
  readonly traces: TelemetrySpanOptions[] = [];

  async trace<T>(
    options: TelemetrySpanOptions,
    operation: () => Promise<T>,
  ): Promise<T> {
    this.traces.push(options);
    return operation();
  }

  captureException(): void {}
  setUser(): void {}
}

describe("instrumentUseCases", () => {
  it("wraps execute methods with stable semantic names and preserves behavior", async () => {
    const telemetry = new FakeTelemetry();
    const useCase = {
      prefix: "hello",
      async execute(value: string) {
        return `${this.prefix}:${value}`;
      },
    };
    const useCases = instrumentUseCases(
      "test-module",
      { runThing: useCase, metadata: "unchanged" },
      telemetry,
    );

    await expect(useCases.runThing.execute("world")).resolves.toBe("hello:world");
    expect(useCases.metadata).toBe("unchanged");
    expect(telemetry.traces).toEqual([
      {
        name: "use_case test-module.runThing",
        operation: "use_case.execute",
        attributes: {
          "fabra.layer": "application",
          "fabra.module": "test-module",
          "fabra.use_case": "runThing",
        },
      },
    ]);
  });

  it("preserves thrown error identity and executes once", async () => {
    const telemetry = new FakeTelemetry();
    const error = new Error("failed");
    const execute = vi.fn(async () => {
      throw error;
    });
    const useCases = instrumentUseCases(
      "test-module",
      { fail: { execute } },
      telemetry,
    );

    await expect(useCases.fail.execute()).rejects.toBe(error);
    expect(execute).toHaveBeenCalledOnce();
  });
});
