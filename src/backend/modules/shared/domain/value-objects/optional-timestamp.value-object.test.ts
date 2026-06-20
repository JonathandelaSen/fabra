import { describe, expect, it } from "vitest";
import { OptionalTimestamp } from "./optional-timestamp.value-object";

describe("OptionalTimestamp", () => {
  it("round-trips an ISO timestamp", () => {
    const value = "2026-06-20T10:00:00.000Z";
    expect(OptionalTimestamp.fromPrimitives(value).toPrimitives()).toBe(value);
  });

  it("allows null", () => {
    expect(OptionalTimestamp.fromPrimitives(null).toPrimitives()).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(() => OptionalTimestamp.fromPrimitives("   ")).toThrow();
  });
});
