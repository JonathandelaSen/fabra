import { describe, expect, it } from "vitest";
import { ReviewSelfAssessmentPromptService } from "./review-self-assessment-prompt.service";
import type { ReviewSelfAssessmentAIInput } from "../repositories/review-self-assessment-ai.service";

describe("ReviewSelfAssessmentPromptService", () => {
  const service = new ReviewSelfAssessmentPromptService();
  const input = {
    title: "H1 Review",
    reviewType: "promotion_case",
    periodStart: "2026-01-01",
    periodEnd: "2026-06-30",
    evidence: [
      {
        source: "work_journal",
        date: "2026-03-01",
        highlighted: true,
        content: "Led the platform migration",
      },
    ],
  } as unknown as ReviewSelfAssessmentAIInput;

  it("returns the self-assessment system instruction", () => {
    expect(service.systemInstruction()).toContain(
      "write a self-assessment document",
    );
  });

  it("labels the review type and lists highlighted evidence in the integrated prompt", () => {
    const prompt = service.build(input);

    expect(prompt).toContain("Type: promotion case");
    expect(prompt).toContain("[HIGHLIGHTED]");
    expect(prompt).toContain("Led the platform migration");
    expect(prompt).toContain("Write the self-assessment as Markdown");
  });

  it("wraps the copy-paste prompt in the provided envelope", () => {
    const prompt = service.buildForClipboard(input, {
      workflowId: "performance_review.self_assessment",
      schemaVersion: "1",
    });

    expect(prompt).toContain('"workflowId": "performance_review.self_assessment"');
    expect(prompt).toContain('"schemaVersion": "1"');
    expect(prompt).toContain("Respond ONLY with a JSON object");
  });
});
