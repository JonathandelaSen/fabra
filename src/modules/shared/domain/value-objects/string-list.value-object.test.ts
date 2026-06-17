import { describe, expect, it } from "vitest";
import { StringList } from "./string-list.value-object";

describe("StringList", () => {
  it("can be created from primitives and round-trips correctly", () => {
    const val = ["a", "b", "c"];
    const vo = StringList.fromPrimitives(val);
    expect(vo.toPrimitives()).toEqual(val);
  });
});
