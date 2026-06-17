import { describe, expect, it } from "vitest";
import { LongText } from "./long-text.value-object";

describe("LongText", () => {
  it("can be created from primitives and round-trips correctly", () => {
    const val = "Some feedback or text";
    const vo = LongText.fromPrimitives(val);
    expect(vo.toPrimitives()).toBe(val);
  });
});
