import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidReceivedFeedbackTextError extends DomainError {
  constructor(value: string, message: string) {
    super(ErrorCode.INVALID_RECEIVED_FEEDBACK_TEXT, message, { value });
    this.name = "InvalidReceivedFeedbackTextError";
  }
}

export class ReceivedFeedbackText extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidReceivedFeedbackTextError(value, "Received feedback text cannot be empty.");
    if (value.length > 10000) throw new InvalidReceivedFeedbackTextError(value, "Received feedback text is too long.");
  }

  static fromPrimitives(value: string): ReceivedFeedbackText {
    return new ReceivedFeedbackText(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
