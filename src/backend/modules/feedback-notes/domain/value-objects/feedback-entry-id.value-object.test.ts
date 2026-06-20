import { describe, expect, it } from "vitest";
import { FeedbackEntryId } from "./feedback-entry-id.value-object";

describe("FeedbackEntryId", () => {
  it("round-trips primitives", () => {
    expect(FeedbackEntryId.fromPrimitives("entry-1").toPrimitives()).toBe(
      "entry-1",
    );
  });

  it("rejects blank values", () => {
    expect(() => FeedbackEntryId.fromPrimitives(" ")).toThrow("empty");
  });
});
