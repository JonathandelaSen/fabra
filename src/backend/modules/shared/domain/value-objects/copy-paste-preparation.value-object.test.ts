import { describe, expect, it } from "vitest";
import {
  CopyPastePreparation,
  type CopyPastePreparationPrimitives,
} from "./copy-paste-preparation.value-object";

const jsonPrimitives: CopyPastePreparationPrimitives = {
  workflowId: "cv_analysis.score",
  schemaVersion: "1",
  prompt: "Score this CV",
  expectedResponse: { kind: "json", envelope: true },
  privacyNotice: "CV data is sent to the external chat.",
  interactionId: null,
  attemptId: null,
};

describe("CopyPastePreparation", () => {
  it("creates from primitives and exposes accessors", () => {
    const prep = CopyPastePreparation.fromPrimitives(jsonPrimitives);

    expect(prep.workflowId).toBe("cv_analysis.score");
    expect(prep.schemaVersion).toBe("1");
    expect(prep.prompt).toBe("Score this CV");
    expect(prep.expectedResponse).toEqual({ kind: "json", envelope: true });
    expect(prep.privacyNotice).toBe("CV data is sent to the external chat.");
    expect(prep.interactionId).toBeNull();
    expect(prep.attemptId).toBeNull();
  });

  it("round-trips through toPrimitives", () => {
    const prep = CopyPastePreparation.fromPrimitives(jsonPrimitives);
    expect(prep.toPrimitives()).toEqual(jsonPrimitives);
  });

  it("supports plain text responses without an envelope", () => {
    const prep = CopyPastePreparation.fromPrimitives({
      ...jsonPrimitives,
      expectedResponse: { kind: "plain_text", envelope: null },
    });
    expect(prep.toPrimitives().expectedResponse).toEqual({
      kind: "plain_text",
      envelope: null,
    });
  });

  it("rejects an unknown response kind", () => {
    expect(() =>
      CopyPastePreparation.fromPrimitives({
        ...jsonPrimitives,
        expectedResponse: { kind: "bogus", envelope: null },
      }),
    ).toThrow();
  });

  it("carries optional interaction and attempt ids", () => {
    const prep = CopyPastePreparation.fromPrimitives({
      ...jsonPrimitives,
      interactionId: "int-1",
      attemptId: "att-1",
    });
    expect(prep.interactionId).toBe("int-1");
    expect(prep.attemptId).toBe("att-1");
  });

  it("throws when required fields are empty", () => {
    expect(() =>
      CopyPastePreparation.fromPrimitives({ ...jsonPrimitives, prompt: "  " }),
    ).toThrow();
    expect(() =>
      CopyPastePreparation.fromPrimitives({ ...jsonPrimitives, workflowId: "" }),
    ).toThrow();
  });
});
