import type {
  ReviewSelfAssessmentAIInput,
  ReviewSelfAssessmentAIService,
} from "../../domain/repositories/review-self-assessment-ai.service";

class MockReviewSelfAssessmentAIService
  implements ReviewSelfAssessmentAIService
{
  async generate(input: ReviewSelfAssessmentAIInput): Promise<string> {
    const lines = [
      `# Self-assessment (mock) — ${input.title}`,
      "",
      "> This is deterministic mock output for local/dev/test use. It is not real AI generation.",
      "",
      `Review period: ${input.periodStart} to ${input.periodEnd}.`,
      "",
      "## Achievements",
    ];
    if (input.evidence.length === 0) {
      lines.push("", "_No curated evidence was provided._");
    } else {
      for (const item of input.evidence) {
        const date = item.date ? ` (${item.date})` : "";
        lines.push(`- ${item.content} — source: ${item.source}${date}.`);
      }
    }
    return lines.join("\n");
  }
}

export class MockReviewSelfAssessmentAIServiceFactory {
  create(): ReviewSelfAssessmentAIService {
    return new MockReviewSelfAssessmentAIService();
  }
}
