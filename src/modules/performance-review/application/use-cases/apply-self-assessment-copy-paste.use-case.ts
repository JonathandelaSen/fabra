import { Timestamp, UserId, badRequest, type EventBus } from "@/modules/shared";
import { validateCopyPasteEnvelope } from "@/modules/shared/application/assisted-workflows/copy-paste-json-envelope";
import type { PerformanceReview } from "../../domain/entities/performance-review.entity";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";
import { SelfAssessmentMode } from "../../domain/value-objects/self-assessment-mode.value-object";
import {
  SELF_ASSESSMENT_SCHEMA_VERSION,
  SELF_ASSESSMENT_WORKFLOW_ID,
} from "./prepare-self-assessment-copy-paste.use-case";

export interface ApplySelfAssessmentCopyPasteInput {
  reviewId: string;
  userId: string;
  envelope: unknown;
}

export class ApplySelfAssessmentCopyPasteUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(
    input: ApplySelfAssessmentCopyPasteInput,
  ): Promise<PerformanceReview> {
    const userId = UserId.fromPrimitives(input.userId);
    const review = await this.deps.reviewRepo.findById(
      PerformanceReviewId.fromPrimitives(input.reviewId),
      userId,
    );
    if (!review) throw new PerformanceReviewNotFoundError();

    const result = validateCopyPasteEnvelope(input.envelope, {
      workflowId: SELF_ASSESSMENT_WORKFLOW_ID,
      schemaVersion: SELF_ASSESSMENT_SCHEMA_VERSION,
    });

    const content = result.content;
    if (typeof content !== "string" || !content.trim()) {
      throw badRequest("The pasted response must include a non-empty content.");
    }

    const now = Timestamp.fromPrimitives(new Date().toISOString());
    review.attachSelfAssessment({
      content,
      mode: SelfAssessmentMode.fromPrimitives("copy_paste"),
      generatedAt: now,
      updatedAt: now,
    });

    const saved = await this.deps.reviewRepo.save(review);
    await this.deps.eventBus.publish(review.pullDomainEvents());
    return saved;
  }
}
