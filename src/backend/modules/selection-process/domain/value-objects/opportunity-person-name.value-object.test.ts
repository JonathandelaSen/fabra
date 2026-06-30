import { describe, expect, it } from "vitest";
import { OpportunityPersonName } from "./opportunity-person-name.value-object";

describe("OpportunityPersonName", () => {
  it("trims a person's name", () => {
    expect(
      OpportunityPersonName.fromPrimitives("  Marta García  ").toPrimitives(),
    ).toBe("Marta García");
  });

  it("rejects a blank name", () => {
    expect(() => OpportunityPersonName.fromPrimitives("   ")).toThrow(
      "Opportunity person name is required",
    );
  });
});
