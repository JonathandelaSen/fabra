import { describe, expect, it } from "vitest";
import { SelectionProcessFixture } from "./selection-process.fixture";

describe("SelectionProcessFixture", () => {
  it("builds varied people for a seeded hiring process", () => {
    const people = SelectionProcessFixture.createOpportunityPersonProfiles(
      "Acme Corp",
    );

    expect(people).toHaveLength(3);
    expect(people.map((person) => person.role)).toEqual([
      "external_recruiter",
      "hiring_manager",
      "technical_interviewer",
    ]);
    expect(people[1]?.organization).toBe("Acme Corp");
    expect(people.every((person) => person.notes)).toBe(true);
    expect(
      people.every((person) => (person.links?.length ?? 0) > 0),
    ).toBe(true);
  });
});
