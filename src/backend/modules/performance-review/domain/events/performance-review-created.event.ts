import type { DomainEvent } from "@/modules/shared";

export class PerformanceReviewCreatedEvent
  implements DomainEvent<{ reviewId: string }>
{
  readonly eventName = "performance_review_created";
  readonly occurredAt = new Date();

  constructor(private readonly reviewId: string) {}

  toPrimitives(): { reviewId: string } {
    return { reviewId: this.reviewId };
  }
}
