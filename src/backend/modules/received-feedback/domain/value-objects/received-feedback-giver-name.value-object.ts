import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidReceivedFeedbackGiverNameError extends DomainError {
  constructor(value: string, message: string) {
    super(ErrorCode.INVALID_RECEIVED_FEEDBACK_GIVER_NAME, message, { value });
    this.name = "InvalidReceivedFeedbackGiverNameError";
  }
}

export class ReceivedFeedbackGiverName extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidReceivedFeedbackGiverNameError(value, "Received feedback giver name cannot be empty.");
    if (value.length > 120) throw new InvalidReceivedFeedbackGiverNameError(value, "Received feedback giver name is too long.");
  }

  static fromPrimitives(value: string): ReceivedFeedbackGiverName {
    return new ReceivedFeedbackGiverName(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
