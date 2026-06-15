import { ErrorCode } from "@/shared/error-codes";
import { DomainError, ValueObject } from "@/modules/shared";

export const REVIEW_STATUS = {
  draft: "draft",
  prepared: "prepared",
  completed: "completed",
} as const;

export const REVIEW_STATUSES = [
  REVIEW_STATUS.draft,
  REVIEW_STATUS.prepared,
  REVIEW_STATUS.completed,
] as const;

export type ReviewStatusValue = (typeof REVIEW_STATUSES)[number];

export class ReviewStatus extends ValueObject<ReviewStatusValue> {
  private constructor(private readonly value: ReviewStatusValue) {
    super();
  }

  static fromPrimitives(value: string): ReviewStatus {
    if (!REVIEW_STATUSES.includes(value as ReviewStatusValue)) {
      throw new DomainError(ErrorCode.VALIDATION_FAILED, `Invalid review status: ${value}`);
    }
    return new ReviewStatus(value as ReviewStatusValue);
  }

  toPrimitives(): ReviewStatusValue {
    return this.value;
  }
}
