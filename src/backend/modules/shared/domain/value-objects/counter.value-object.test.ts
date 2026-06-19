import { describe, expect, it } from "vitest";
import { Counter } from "./counter.value-object";

describe("Counter", () => {
  it("can be created from primitives", () => {
    const value = 5;
    const vo = Counter.fromPrimitives(value);
    expect(vo.toPrimitives()).toBe(value);
  });

  it("throws an error if negative value is passed", () => {
    expect(() => Counter.fromPrimitives(-1)).toThrow("Counter value cannot be negative.");
  });
});
