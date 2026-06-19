import type { DomainEvent } from "@/backend/modules/shared";

export class PerformanceReviewUpdatedEvent
  implements DomainEvent<{ reviewId: string; fields: string[] }>
{
  readonly eventName = "performance_review_updated";
  readonly occurredAt = new Date();

  constructor(
    private readonly reviewId: string,
    private readonly fields: string[],
  ) {}

  toPrimitives(): { reviewId: string; fields: string[] } {
    return { reviewId: this.reviewId, fields: this.fields };
  }
}
