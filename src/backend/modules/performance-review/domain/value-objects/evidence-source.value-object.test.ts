import { describe, expect, it } from "vitest";
import { EvidenceSource, InvalidEvidenceSourceError } from "./evidence-source.value-object";

describe("EvidenceSource", () => {
  it("accepts known sources", () => {
    expect(EvidenceSource.fromPrimitives("journal_entry").toPrimitives()).toBe(
      "journal_entry",
    );
  });

  it("rejects unknown sources", () => {
    expect(() => EvidenceSource.fromPrimitives("bogus")).toThrow(InvalidEvidenceSourceError);
  });
});
