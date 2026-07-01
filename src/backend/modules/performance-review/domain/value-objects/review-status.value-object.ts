import { ErrorCode } from "@/shared/error-codes";
import { DomainError, ValueObject } from "@/backend/modules/shared";

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

export class InvalidReviewStatusError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_REVIEW_STATUS, `Invalid review status: ${value}`, { value });
    this.name = "InvalidReviewStatusError";
  }
}

export class ReviewStatus extends ValueObject<ReviewStatusValue> {
  private constructor(private readonly value: ReviewStatusValue) {
    super();
  }

  static fromPrimitives(value: string): ReviewStatus {
    if (!REVIEW_STATUSES.includes(value as ReviewStatusValue)) {
      throw new InvalidReviewStatusError(value);
    }
    return new ReviewStatus(value as ReviewStatusValue);
  }

  static draft(): ReviewStatus {
    return new ReviewStatus(REVIEW_STATUS.draft);
  }

  static prepared(): ReviewStatus {
    return new ReviewStatus(REVIEW_STATUS.prepared);
  }

  static completed(): ReviewStatus {
    return new ReviewStatus(REVIEW_STATUS.completed);
  }

  isDraft(): boolean {
    return this.value === REVIEW_STATUS.draft;
  }

  isPrepared(): boolean {
    return this.value === REVIEW_STATUS.prepared;
  }

  isCompleted(): boolean {
    return this.value === REVIEW_STATUS.completed;
  }

  toPrimitives(): ReviewStatusValue {
    return this.value;
  }
}
