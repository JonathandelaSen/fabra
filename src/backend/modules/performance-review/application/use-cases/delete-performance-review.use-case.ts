import { ExecutionResult, UserId, type EventBus } from "@/modules/shared";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";

export interface DeletePerformanceReviewInput {
  id: string;
  userId: string;
}

export class DeletePerformanceReviewUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: DeletePerformanceReviewInput): Promise<ExecutionResult> {
    const reviewId = PerformanceReviewId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const existing = await this.deps.reviewRepo.findById(reviewId, userId);
    if (!existing) return ExecutionResult.fail();

    existing.delete();
    const deleted = await this.deps.reviewRepo.delete(reviewId, userId);
    if (deleted) await this.deps.eventBus.publish(existing.pullDomainEvents());
    return ExecutionResult.fromPrimitives(deleted);
  }
}
