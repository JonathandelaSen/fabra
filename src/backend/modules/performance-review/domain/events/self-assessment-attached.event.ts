import type { DomainEvent } from "@/backend/modules/shared";

export class SelfAssessmentAttachedEvent
  implements DomainEvent<{ reviewId: string; mode: string }>
{
  readonly eventName = "performance_review_self_assessment_attached";
  readonly occurredAt = new Date();

  constructor(
    private readonly reviewId: string,
    private readonly mode: string,
  ) {}

  toPrimitives(): { reviewId: string; mode: string } {
    return { reviewId: this.reviewId, mode: this.mode };
  }
}
