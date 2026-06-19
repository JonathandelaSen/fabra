import { describe, expect, it } from "vitest";
import { ActivityContextRoleOrLabel } from "./activity-context-role-or-label.value-object";

describe("ActivityContextRoleOrLabel", () => {
  it("trims a value", () => {
    expect(ActivityContextRoleOrLabel.fromPrimitives("  Engineer  ").toPrimitives()).toBe("Engineer");
  });

  it("normalizes blank and null to null", () => {
    expect(ActivityContextRoleOrLabel.fromPrimitives("   ").toPrimitives()).toBeNull();
    expect(ActivityContextRoleOrLabel.fromPrimitives(null).toPrimitives()).toBeNull();
  });
});
