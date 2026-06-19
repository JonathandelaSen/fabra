import { describe, expect, it } from "vitest";
import { EVIDENCE_SOURCE } from "./evidence-source.value-object";
import {
  EvidenceCandidate,
  type EvidenceCandidatePrimitives,
} from "./evidence-candidate.value-object";

const basePrimitives: EvidenceCandidatePrimitives = {
  source: EVIDENCE_SOURCE.journalEntry,
  sourceId: "j1",
  date: "2026-02-01",
  content: "journal entry content",
};

describe("EvidenceCandidate", () => {
  it("creates from primitives and exposes accessors", () => {
    const candidate = EvidenceCandidate.fromPrimitives(basePrimitives);

    expect(candidate.source).toBe(EVIDENCE_SOURCE.journalEntry);
    expect(candidate.sourceId).toBe("j1");
    expect(candidate.date).toBe("2026-02-01");
    expect(candidate.content).toBe("journal entry content");
  });

  it("round-trips through toPrimitives", () => {
    const candidate = EvidenceCandidate.fromPrimitives(basePrimitives);
    expect(candidate.toPrimitives()).toEqual(basePrimitives);
  });

  it("allows a null date", () => {
    const candidate = EvidenceCandidate.fromPrimitives({
      ...basePrimitives,
      date: null,
    });
    expect(candidate.date).toBeNull();
  });

  it("throws for an invalid source", () => {
    expect(() =>
      EvidenceCandidate.fromPrimitives({
        ...basePrimitives,
        source: "bogus" as EvidenceCandidatePrimitives["source"],
      }),
    ).toThrow();
  });

  it("throws for an empty sourceId", () => {
    expect(() =>
      EvidenceCandidate.fromPrimitives({ ...basePrimitives, sourceId: "  " }),
    ).toThrow();
  });

  it("throws for a malformed date", () => {
    expect(() =>
      EvidenceCandidate.fromPrimitives({ ...basePrimitives, date: "01-02-2026" }),
    ).toThrow();
  });

  it("throws for empty content", () => {
    expect(() =>
      EvidenceCandidate.fromPrimitives({ ...basePrimitives, content: "   " }),
    ).toThrow();
  });
});
