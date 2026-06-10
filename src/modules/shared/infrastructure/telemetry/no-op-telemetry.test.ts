import { describe, expect, it, vi } from "vitest";
import { NoOpTelemetry } from "./no-op-telemetry";

describe("NoOpTelemetry", () => {
  it("executes successful operations exactly once", async () => {
    const operation = vi.fn(async () => "result");

    await expect(
      new NoOpTelemetry().trace({ name: "test", operation: "test" }, operation),
    ).resolves.toBe("result");
    expect(operation).toHaveBeenCalledOnce();
  });

  it("rethrows the original business error", async () => {
    const error = new Error("business failure");
    const operation = vi.fn(async () => {
      throw error;
    });

    await expect(
      new NoOpTelemetry().trace({ name: "test", operation: "test" }, operation),
    ).rejects.toBe(error);
    expect(operation).toHaveBeenCalledOnce();
  });

  it("ignores captures and user context", () => {
    const telemetry = new NoOpTelemetry();

    expect(() =>
      telemetry.captureException(new Error("ignored")),
    ).not.toThrow();
    expect(() => telemetry.setUser({ id: "user-id" })).not.toThrow();
    expect(() => telemetry.setUser(null)).not.toThrow();
    expect(() =>
      telemetry.log({ level: "info", message: "ignored" }),
    ).not.toThrow();
  });
});
