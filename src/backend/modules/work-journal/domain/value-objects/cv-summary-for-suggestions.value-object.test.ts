import { describe, expect, it } from "vitest";
import { CVSummaryForSuggestions } from "./cv-summary-for-suggestions.value-object";

describe("CVSummaryForSuggestions", () => {
  it("can be created from primitives", () => {
    const primitives = {
      type: "uploaded",
      profile: null,
    };
    const vo = CVSummaryForSuggestions.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
