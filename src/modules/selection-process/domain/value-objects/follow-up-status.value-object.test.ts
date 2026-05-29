import { describe, expect, it } from "vitest";
import { FollowUpStatus } from "./follow-up-status.value-object";

describe("FollowUpStatus", () => {
  it("accepts known statuses", () => {
    expect(FollowUpStatus.fromPrimitives("interview").toPrimitives()).toBe("interview");
  });

  it("rejects unknown statuses", () => {
    expect(() => FollowUpStatus.fromPrimitives("unknown")).toThrow("Invalid follow-up status");
  });
});
