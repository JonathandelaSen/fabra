import type { DomainEvent } from "@/backend/modules/shared";

export class PerformanceReviewDeletedEvent
  implements DomainEvent<{ reviewId: string }>
{
  readonly eventName = "performance_review_deleted";
  readonly occurredAt = new Date();

  constructor(private readonly reviewId: string) {}

  toPrimitives(): { reviewId: string } {
    return { reviewId: this.reviewId };
  }
}
