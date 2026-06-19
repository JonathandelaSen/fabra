import { CopyPastePreparation, UserId } from "@/modules/shared";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import type { ReviewEvidenceItemRepository } from "../../domain/repositories/review-evidence-item.repository";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";
import { buildSelfAssessmentCopyPastePrompt } from "../services/review-self-assessment-copy-paste-prompts";
import { buildReviewSelfAssessmentAIInput } from "../services/build-self-assessment-input";

export const SELF_ASSESSMENT_WORKFLOW_ID = "performance_review.self_assessment";
export const SELF_ASSESSMENT_SCHEMA_VERSION = "1";

export interface PrepareSelfAssessmentCopyPasteInput {
  reviewId: string;
  userId: string;
}

export class PrepareSelfAssessmentCopyPasteUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      itemRepo: ReviewEvidenceItemRepository;
    },
  ) {}

  async execute(
    input: PrepareSelfAssessmentCopyPasteInput,
  ): Promise<CopyPastePreparation> {
    const userId = UserId.fromPrimitives(input.userId);
    const reviewId = PerformanceReviewId.fromPrimitives(input.reviewId);
    const review = await this.deps.reviewRepo.findById(reviewId, userId);
    if (!review) throw new PerformanceReviewNotFoundError();

    const items = await this.deps.itemRepo.search({ userId, reviewId });
    const aiInput = buildReviewSelfAssessmentAIInput(review, items);

    const prompt = buildSelfAssessmentCopyPastePrompt(aiInput, {
      workflowId: SELF_ASSESSMENT_WORKFLOW_ID,
      schemaVersion: SELF_ASSESSMENT_SCHEMA_VERSION,
    });

    return CopyPastePreparation.fromPrimitives({
      workflowId: SELF_ASSESSMENT_WORKFLOW_ID,
      schemaVersion: SELF_ASSESSMENT_SCHEMA_VERSION,
      prompt,
      expectedResponse: { kind: "json", envelope: true },
      privacyNotice:
        "This prompt embeds your curated review evidence. Paste it only into external AI tools you trust.",
      interactionId: null,
      attemptId: null,
    });
  }
}
