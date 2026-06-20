import { describe, expect, it } from "vitest";
import { CVDateRange } from "./cv-date-range.value-object";

describe("CVDateRange", () => {
  it("round-trips a full range", () => {
    const primitives = { start: "2020", end: "2022", current: false };
    expect(CVDateRange.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
  });

  it("omits absent fields", () => {
    expect(CVDateRange.fromPrimitives({ current: true }).toPrimitives()).toEqual({
      current: true,
    });
  });
});
