import { describe, expect, it } from "vitest";
import { CVPublicId } from "./cv-public-id.value-object";

describe("CVPublicId", () => {
  it("round-trips primitives", () => {
    expect(CVPublicId.fromPrimitives("public-1").toPrimitives()).toBe(
      "public-1",
    );
  });

  it("rejects blank values", () => {
    expect(() => CVPublicId.fromPrimitives(" ")).toThrow("empty");
  });
});
