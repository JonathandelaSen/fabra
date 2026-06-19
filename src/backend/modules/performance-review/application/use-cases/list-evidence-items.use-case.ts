import { UserId } from "@/modules/shared";
import type { ReviewEvidenceItem } from "../../domain/entities/review-evidence-item.entity";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import type { ReviewEvidenceItemRepository } from "../../domain/repositories/review-evidence-item.repository";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";

export interface ListEvidenceItemsInput {
  reviewId: string;
  userId: string;
}

export class ListEvidenceItemsUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      itemRepo: ReviewEvidenceItemRepository;
    },
  ) {}

  async execute(input: ListEvidenceItemsInput): Promise<ReviewEvidenceItem[]> {
    const userId = UserId.fromPrimitives(input.userId);
    const reviewId = PerformanceReviewId.fromPrimitives(input.reviewId);
    const review = await this.deps.reviewRepo.findById(reviewId, userId);
    if (!review) throw new PerformanceReviewNotFoundError();

    return this.deps.itemRepo.search({ userId, reviewId });
  }
}
