import { describe, expect, it } from "vitest";
import { ProcessQuestionReadModel } from "./process-question-read-model.value-object";

describe("ProcessQuestionReadModel", () => {
  it("can be created from primitives", () => {
    const primitives = {
      question: {
        id: "00000000-0000-0000-0000-000000000001",
        userId: "00000000-0000-0000-0000-000000000002",
        jobOpportunityId: null,
        question: "What motivates you?",
        context: null,
        answer: null,
        aiModel: null,
        aiGeneratedAt: null,
        sourceJobMatchAnalysisId: null,
        legacyInterviewQuestionId: null,
        legacyCvId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      cv: null,
      analysis: null,
    };
    const vo = ProcessQuestionReadModel.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
