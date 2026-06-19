import { beforeEach, describe, expect, it, vi } from "vitest";

const sentry = vi.hoisted(() => ({
  startSpan: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  withScope: vi.fn((callback: (scope: { setAttributes: () => void }) => void) =>
    callback({ setAttributes: vi.fn() }),
  ),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@sentry/nextjs", () => sentry);

import { SentryTelemetry } from "./sentry-telemetry";

describe("SentryTelemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sentry.startSpan.mockImplementation(async (_options, callback) =>
      callback({ setStatus: vi.fn() }),
    );
  });

  it("maps traces and returns the business result", async () => {
    const operation = vi.fn(async () => "result");

    await expect(
      new SentryTelemetry().trace(
        {
          name: "use_case test.run",
          operation: "use_case.execute",
          attributes: { "fabra.layer": "application" },
        },
        operation,
      ),
    ).resolves.toBe("result");

    expect(operation).toHaveBeenCalledOnce();
    expect(sentry.startSpan).toHaveBeenCalledWith(
      {
        name: "use_case test.run",
        op: "use_case.execute",
        attributes: { "fabra.layer": "application" },
      },
      expect.any(Function),
    );
  });

  it("marks failed spans and rethrows the original business error", async () => {
    const setStatus = vi.fn();
    sentry.startSpan.mockImplementation(async (_options, callback) =>
      callback({ setStatus }),
    );
    const error = new Error("business failure");

    await expect(
      new SentryTelemetry().trace(
        { name: "test", operation: "test" },
        async () => {
          throw error;
        },
      ),
    ).rejects.toBe(error);

    expect(setStatus).toHaveBeenCalledWith({
      code: 2,
      message: "internal_error",
    });
    expect(sentry.captureException).not.toHaveBeenCalled();
  });

  it("runs the operation once when the provider fails before or after it", async () => {
    const beforeOperation = vi.fn(async () => "before");
    sentry.startSpan.mockRejectedValueOnce(new Error("provider before"));

    await expect(
      new SentryTelemetry().trace(
        { name: "test", operation: "test" },
        beforeOperation,
      ),
    ).resolves.toBe("before");
    expect(beforeOperation).toHaveBeenCalledOnce();

    const afterOperation = vi.fn(async () => "after");
    sentry.startSpan.mockImplementationOnce(async (_options, callback) => {
      await callback({ setStatus: vi.fn() });
      throw new Error("provider after");
    });

    await expect(
      new SentryTelemetry().trace(
        { name: "test", operation: "test" },
        afterOperation,
      ),
    ).resolves.toBe("after");
    expect(afterOperation).toHaveBeenCalledOnce();
  });

  it("maps capture and user context and swallows provider failures", () => {
    const telemetry = new SentryTelemetry();
    const error = new Error("captured");

    telemetry.captureException(error);
    telemetry.setUser({ id: "user-id" });
    telemetry.setUser(null);

    expect(sentry.captureException).toHaveBeenCalledWith(error);
    expect(sentry.setUser).toHaveBeenNthCalledWith(1, { id: "user-id" });
    expect(sentry.setUser).toHaveBeenNthCalledWith(2, null);

    sentry.captureException.mockImplementationOnce(() => {
      throw new Error("provider failure");
    });
    sentry.setUser.mockImplementationOnce(() => {
      throw new Error("provider failure");
    });
    expect(() => telemetry.captureException(error)).not.toThrow();
    expect(() => telemetry.setUser(null)).not.toThrow();
  });

  it("maps structured logs and swallows provider failures", () => {
    const telemetry = new SentryTelemetry();

    telemetry.log({
      level: "info",
      message: "Domain event published",
      attributes: { "fabra.domain_event": "dummy.event" },
    });

    expect(sentry.logger.info).toHaveBeenCalledWith("Domain event published", {
      "fabra.domain_event": "dummy.event",
    });

    sentry.logger.info.mockImplementationOnce(() => {
      throw new Error("provider failure");
    });
    expect(() =>
      telemetry.log({ level: "info", message: "still safe" }),
    ).not.toThrow();
  });
});
