import { describe, expect, it } from "vitest";
import { OpportunityPersonId } from "./opportunity-person-id.value-object";

describe("OpportunityPersonId", () => {
  it("round-trips a non-empty identifier", () => {
    expect(OpportunityPersonId.fromPrimitives("person-1").toPrimitives()).toBe(
      "person-1",
    );
  });

  it("rejects an empty identifier", () => {
    expect(() => OpportunityPersonId.fromPrimitives(" ")).toThrow(
      "Opportunity person id is required",
    );
  });
});
