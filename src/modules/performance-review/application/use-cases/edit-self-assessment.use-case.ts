import { Timestamp, UserId, type EventBus } from "@/modules/shared";
import type { PerformanceReview } from "../../domain/entities/performance-review.entity";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";
import { SelfAssessmentMode } from "../../domain/value-objects/self-assessment-mode.value-object";

export interface EditSelfAssessmentInput {
  id: string;
  userId: string;
  content: string;
  mode?: string;
}

export class EditSelfAssessmentUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: EditSelfAssessmentInput): Promise<PerformanceReview> {
    const userId = UserId.fromPrimitives(input.userId);
    const review = await this.deps.reviewRepo.findById(
      PerformanceReviewId.fromPrimitives(input.id),
      userId,
    );
    if (!review) throw new PerformanceReviewNotFoundError();

    const now = Timestamp.fromPrimitives(new Date().toISOString());
    review.attachSelfAssessment({
      content: input.content,
      mode: SelfAssessmentMode.fromPrimitives(input.mode ?? "manual"),
      generatedAt: now,
      updatedAt: now,
    });

    const saved = await this.deps.reviewRepo.save(review);
    await this.deps.eventBus.publish(review.pullDomainEvents());
    return saved;
  }
}
