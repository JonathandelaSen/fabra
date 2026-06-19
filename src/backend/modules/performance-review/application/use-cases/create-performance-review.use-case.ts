import {
  EntityId,
  IsoDate,
  Timestamp,
  UserId,
  type EventBus,
} from "@/modules/shared";
import { PerformanceReview } from "../../domain/entities/performance-review.entity";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";
import { ReviewTitle } from "../../domain/value-objects/review-title.value-object";
import { ReviewType } from "../../domain/value-objects/review-type.value-object";

export interface CreatePerformanceReviewInput {
  userId: string;
  activityContextId?: string | null;
  title: string;
  reviewType: string;
  reviewDate: string;
  periodStart: string;
  periodEnd: string;
}

export class CreatePerformanceReviewUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: CreatePerformanceReviewInput): Promise<PerformanceReview> {
    const now = new Date().toISOString();
    const review = PerformanceReview.create({
      id: PerformanceReviewId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(input.userId),
      activityContextId: input.activityContextId
        ? EntityId.fromPrimitives(input.activityContextId)
        : null,
      title: ReviewTitle.fromPrimitives(input.title),
      reviewType: ReviewType.fromPrimitives(input.reviewType),
      reviewDate: IsoDate.fromPrimitives(input.reviewDate),
      periodStart: IsoDate.fromPrimitives(input.periodStart),
      periodEnd: IsoDate.fromPrimitives(input.periodEnd),
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    const saved = await this.deps.reviewRepo.save(review);
    await this.deps.eventBus.publish(review.pullDomainEvents());
    return saved;
  }
}
