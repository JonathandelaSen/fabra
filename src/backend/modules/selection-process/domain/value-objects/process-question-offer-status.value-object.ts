import { DomainError, ValueObject } from "@/backend/modules/shared";
import { OFFER_STATUSES, type OfferStatus } from "@/lib/analysis-types";
import { ErrorCode } from "@/shared/error-codes";

class InvalidProcessQuestionOfferStatusError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_PROCESS_QUESTION_OFFER_STATUS, `Invalid offer status: ${value}`, { value });
    this.name = "InvalidProcessQuestionOfferStatusError";
  }
}

export class ProcessQuestionOfferStatus extends ValueObject<OfferStatus> {
  private constructor(private readonly value: OfferStatus) {
    super();
  }

  static fromPrimitives(value: string): ProcessQuestionOfferStatus {
    if (!OFFER_STATUSES.includes(value as OfferStatus)) {
      throw new InvalidProcessQuestionOfferStatusError(value);
    }
    return new ProcessQuestionOfferStatus(value as OfferStatus);
  }

  toPrimitives(): OfferStatus {
    return this.value;
  }
}
