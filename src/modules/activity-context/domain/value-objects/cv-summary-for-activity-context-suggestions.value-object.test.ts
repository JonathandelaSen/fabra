import { describe, expect, it } from "vitest";
import { CVSummaryForActivityContextSuggestions } from "./cv-summary-for-activity-context-suggestions.value-object";

describe("CVSummaryForActivityContextSuggestions", () => {
  it("can be created from primitives", () => {
    const primitives = {
      type: "uploaded",
      profile: null,
    };
    const vo = CVSummaryForActivityContextSuggestions.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
