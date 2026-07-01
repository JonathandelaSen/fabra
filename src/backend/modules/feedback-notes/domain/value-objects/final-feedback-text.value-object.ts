import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidFinalFeedbackTextError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_FINAL_FEEDBACK_TEXT, "Final feedback text cannot be empty.", { value });
    this.name = "InvalidFinalFeedbackTextError";
  }
}

export class FinalFeedbackText extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidFinalFeedbackTextError(value);
  }

  static fromPrimitives(value: string): FinalFeedbackText {
    return new FinalFeedbackText(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
