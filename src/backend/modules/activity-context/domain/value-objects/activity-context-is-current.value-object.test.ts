import { describe, expect, it } from "vitest";
import { ActivityContextIsCurrent } from "./activity-context-is-current.value-object";

describe("ActivityContextIsCurrent", () => {
  it("round-trips true and false", () => {
    expect(ActivityContextIsCurrent.fromPrimitives(true).toPrimitives()).toBe(true);
    expect(ActivityContextIsCurrent.fromPrimitives(false).toPrimitives()).toBe(false);
  });
});
