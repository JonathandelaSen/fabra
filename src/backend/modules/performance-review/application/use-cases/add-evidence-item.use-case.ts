import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import { ReviewEvidenceItem } from "../../domain/entities/review-evidence-item.entity";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import type { ReviewEvidenceItemRepository } from "../../domain/repositories/review-evidence-item.repository";
import { EvidenceContent } from "../../domain/value-objects/evidence-content.value-object";
import { EvidenceSource } from "../../domain/value-objects/evidence-source.value-object";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";
import { ReviewEvidenceItemId } from "../../domain/value-objects/review-evidence-item-id.value-object";

export interface AddEvidenceItemInput {
  reviewId: string;
  userId: string;
  source: string;
  sourceId?: string | null;
  content: string;
  highlighted?: boolean;
}

export class AddEvidenceItemUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      itemRepo: ReviewEvidenceItemRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: AddEvidenceItemInput): Promise<ReviewEvidenceItem> {
    const userId = UserId.fromPrimitives(input.userId);
    const reviewId = PerformanceReviewId.fromPrimitives(input.reviewId);
    const review = await this.deps.reviewRepo.findById(reviewId, userId);
    if (!review) throw new PerformanceReviewNotFoundError();

    const existing = await this.deps.itemRepo.search({ userId, reviewId });
    const nextPosition = existing.reduce(
      (max, item) => Math.max(max, item.toPrimitives().position + 1),
      0,
    );

    const now = Timestamp.fromPrimitives(new Date().toISOString());
    const item = ReviewEvidenceItem.create({
      id: ReviewEvidenceItemId.fromPrimitives(crypto.randomUUID()),
      userId,
      reviewId,
      source: EvidenceSource.fromPrimitives(input.source),
      sourceId: input.sourceId ?? null,
      content: EvidenceContent.fromPrimitives(input.content),
      highlighted: input.highlighted ?? false,
      position: nextPosition,
      createdAt: now,
      updatedAt: now,
    });

    const saved = await this.deps.itemRepo.save(item);
    await this.deps.eventBus.publish(item.pullDomainEvents());
    return saved;
  }
}
