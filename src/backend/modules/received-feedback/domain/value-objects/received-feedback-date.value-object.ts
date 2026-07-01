import { DomainError, IsoDate, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidReceivedFeedbackDateError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_RECEIVED_FEEDBACK_DATE, "Received feedback date cannot be in the future.", { value });
    this.name = "InvalidReceivedFeedbackDateError";
  }
}

export class ReceivedFeedbackDate extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(
    value: string,
    today = new Date().toISOString().slice(0, 10),
  ): ReceivedFeedbackDate {
    IsoDate.fromPrimitives(value);
    if (value > today)
      throw new InvalidReceivedFeedbackDateError(value);
    return new ReceivedFeedbackDate(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
