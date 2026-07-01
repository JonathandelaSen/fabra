import { describe, expect, it } from "vitest";
import { EvidenceContent, InvalidEvidenceContentError } from "./evidence-content.value-object";

describe("EvidenceContent", () => {
  it("trims surrounding whitespace", () => {
    expect(EvidenceContent.fromPrimitives("  done  ").toPrimitives()).toBe(
      "done",
    );
  });

  it("rejects empty content", () => {
    expect(() => EvidenceContent.fromPrimitives("   ")).toThrow(InvalidEvidenceContentError);
  });
});
