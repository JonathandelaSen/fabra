import {
  EntityId,
  IsoDate,
  Timestamp,
  UserId,
  type EventBus,
} from "@/modules/shared";
import type { PerformanceReview } from "../../domain/entities/performance-review.entity";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";
import { ReviewTitle } from "../../domain/value-objects/review-title.value-object";
import { ReviewType } from "../../domain/value-objects/review-type.value-object";
import type { UpdatePerformanceReviewDetails } from "../../domain/entities/performance-review.entity";

export interface UpdatePerformanceReviewInput {
  id: string;
  userId: string;
  activityContextId?: string | null;
  title?: string;
  reviewType?: string;
  reviewDate?: string;
  periodStart?: string;
  periodEnd?: string;
  complete?: boolean;
}

export class UpdatePerformanceReviewUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: UpdatePerformanceReviewInput): Promise<PerformanceReview> {
    const userId = UserId.fromPrimitives(input.userId);
    const review = await this.deps.reviewRepo.findById(
      PerformanceReviewId.fromPrimitives(input.id),
      userId,
    );
    if (!review) throw new PerformanceReviewNotFoundError();

    const now = Timestamp.fromPrimitives(new Date().toISOString());

    const details: UpdatePerformanceReviewDetails = { updatedAt: now };
    if (input.activityContextId !== undefined)
      details.activityContextId = input.activityContextId
        ? EntityId.fromPrimitives(input.activityContextId)
        : null;
    if (input.title !== undefined)
      details.title = ReviewTitle.fromPrimitives(input.title);
    if (input.reviewType !== undefined)
      details.reviewType = ReviewType.fromPrimitives(input.reviewType);
    if (input.reviewDate !== undefined)
      details.reviewDate = IsoDate.fromPrimitives(input.reviewDate);
    if (input.periodStart !== undefined)
      details.periodStart = IsoDate.fromPrimitives(input.periodStart);
    if (input.periodEnd !== undefined)
      details.periodEnd = IsoDate.fromPrimitives(input.periodEnd);

    review.updateDetails(details);
    if (input.complete) review.complete(now);

    const saved = await this.deps.reviewRepo.save(review);
    await this.deps.eventBus.publish(review.pullDomainEvents());
    return saved;
  }
}
