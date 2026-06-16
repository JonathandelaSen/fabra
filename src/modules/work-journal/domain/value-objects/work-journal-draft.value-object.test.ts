import { describe, expect, it } from "vitest";
import { WorkJournalDraft } from "./work-journal-draft.value-object";

describe("WorkJournalDraft", () => {
  it("round-trips draft", () => {
    expect(WorkJournalDraft.fromPrimitives("My drafted text").toPrimitives()).toBe(
      "My drafted text"
    );
  });

  it("rejects blank draft", () => {
    expect(() => WorkJournalDraft.fromPrimitives(" ")).toThrow();
  });
});
