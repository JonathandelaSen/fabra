import type { ReviewSelfAssessmentAIInput } from "../repositories/review-self-assessment-ai.service";
import {
  ReviewSelfAssessmentPrompt,
  type ReviewSelfAssessmentCopyPasteEnvelope,
} from "./review-self-assessment.prompt";

export type { ReviewSelfAssessmentCopyPasteEnvelope };

export class ReviewSelfAssessmentPromptService {
  private readonly prompt = new ReviewSelfAssessmentPrompt();

  systemInstruction(): string {
    return this.prompt.systemInstruction();
  }

  build(input: ReviewSelfAssessmentAIInput): string {
    return this.prompt.build(input);
  }

  buildForClipboard(
    input: ReviewSelfAssessmentAIInput,
    envelope: ReviewSelfAssessmentCopyPasteEnvelope,
  ): string {
    return this.prompt.buildForClipboard(input, envelope);
  }
}
