import type { UserId } from "@/modules/shared";
import type { PerformanceReview } from "../entities/performance-review.entity";
import type { PerformanceReviewId } from "../value-objects/performance-review-id.value-object";

export interface PerformanceReviewSearchCriteria {
  userId: UserId;
}

export interface PerformanceReviewRepository {
  search(criteria: PerformanceReviewSearchCriteria): Promise<PerformanceReview[]>;
  findById(
    id: PerformanceReviewId,
    userId: UserId,
  ): Promise<PerformanceReview | null>;
  save(review: PerformanceReview): Promise<PerformanceReview>;
  delete(id: PerformanceReviewId, userId: UserId): Promise<boolean>;
}
