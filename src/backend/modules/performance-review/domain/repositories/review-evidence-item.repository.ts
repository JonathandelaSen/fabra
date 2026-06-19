import type { UserId } from "@/modules/shared";
import type { ReviewEvidenceItem } from "../entities/review-evidence-item.entity";
import type { PerformanceReviewId } from "../value-objects/performance-review-id.value-object";
import type { ReviewEvidenceItemId } from "../value-objects/review-evidence-item-id.value-object";

export interface ReviewEvidenceItemSearchCriteria {
  userId: UserId;
  reviewId: PerformanceReviewId;
}

export interface ReviewEvidenceItemRepository {
  search(
    criteria: ReviewEvidenceItemSearchCriteria,
  ): Promise<ReviewEvidenceItem[]>;
  findById(
    id: ReviewEvidenceItemId,
    userId: UserId,
  ): Promise<ReviewEvidenceItem | null>;
  save(item: ReviewEvidenceItem): Promise<ReviewEvidenceItem>;
  delete(id: ReviewEvidenceItemId, userId: UserId): Promise<boolean>;
}
