import { describe, expect, it } from "vitest";
import { ImpersonationTokenHash } from "./impersonation-token-hash.value-object";

describe("ImpersonationTokenHash", () => {
  it("round-trips a value", () => {
    expect(ImpersonationTokenHash.fromPrimitives("abc123").toPrimitives()).toBe("abc123");
  });

  it("rejects empty values", () => {
    expect(() => ImpersonationTokenHash.fromPrimitives("   ")).toThrow();
  });
});
