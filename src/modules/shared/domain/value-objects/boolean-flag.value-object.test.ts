import { describe, expect, it } from "vitest";
import { BooleanFlag } from "./boolean-flag.value-object";

describe("BooleanFlag", () => {
  it("round-trips true and false", () => {
    expect(BooleanFlag.fromPrimitives(true).toPrimitives()).toBe(true);
    expect(BooleanFlag.fromPrimitives(false).toPrimitives()).toBe(false);
  });
});
