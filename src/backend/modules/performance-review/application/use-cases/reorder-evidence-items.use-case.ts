import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import type { ReviewEvidenceItem } from "../../domain/entities/review-evidence-item.entity";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import { ReviewEvidenceItemNotFoundError } from "../../domain/errors/review-evidence-item-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import type { ReviewEvidenceItemRepository } from "../../domain/repositories/review-evidence-item.repository";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";

export interface ReorderEvidenceItemsInput {
  reviewId: string;
  userId: string;
  orderedItemIds: string[];
}

export class ReorderEvidenceItemsUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      itemRepo: ReviewEvidenceItemRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(
    input: ReorderEvidenceItemsInput,
  ): Promise<ReviewEvidenceItem[]> {
    const userId = UserId.fromPrimitives(input.userId);
    const reviewId = PerformanceReviewId.fromPrimitives(input.reviewId);
    const review = await this.deps.reviewRepo.findById(reviewId, userId);
    if (!review) throw new PerformanceReviewNotFoundError();

    const existing = await this.deps.itemRepo.search({ userId, reviewId });
    const byId = new Map(existing.map((item) => [item.id, item]));

    const now = Timestamp.fromPrimitives(new Date().toISOString());
    const saved: ReviewEvidenceItem[] = [];
    for (let index = 0; index < input.orderedItemIds.length; index += 1) {
      const item = byId.get(input.orderedItemIds[index]);
      if (!item) throw new ReviewEvidenceItemNotFoundError();
      item.reorder(index, now);
      saved.push(await this.deps.itemRepo.save(item));
      await this.deps.eventBus.publish(item.pullDomainEvents());
    }
    return saved;
  }
}
