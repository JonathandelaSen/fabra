import { describe, expect, it } from "vitest";
import { ExecutionResult } from "./execution-result.value-object";

describe("ExecutionResult", () => {
  it("can be created from primitives", () => {
    expect(ExecutionResult.fromPrimitives(true).toPrimitives()).toBe(true);
    expect(ExecutionResult.fromPrimitives(false).toPrimitives()).toBe(false);
  });

  it("can be created using helpers", () => {
    expect(ExecutionResult.ok().toPrimitives()).toBe(true);
    expect(ExecutionResult.fail().toPrimitives()).toBe(false);
  });
});
