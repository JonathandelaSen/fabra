import { ErrorCode } from "@/shared/error-codes";
import { DomainError, ValueObject } from "@/backend/modules/shared";

export class InvalidReviewTitleError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_REVIEW_TITLE, "Review title cannot be empty.", { value });
    this.name = "InvalidReviewTitleError";
  }
}

export class ReviewTitle extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): ReviewTitle {
    const trimmed = value.trim();
    if (!trimmed) throw new InvalidReviewTitleError(value);
    return new ReviewTitle(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
