import { ValueObject } from "@/backend/modules/shared";
import { OFFER_STATUSES, type OfferStatus } from "@/lib/analysis-types";

export class ProcessQuestionOfferStatus extends ValueObject<OfferStatus> {
  private constructor(private readonly value: OfferStatus) {
    super();
  }

  static fromPrimitives(value: string): ProcessQuestionOfferStatus {
    if (!OFFER_STATUSES.includes(value as OfferStatus)) {
      throw new Error(`Invalid offer status: ${value}`);
    }
    return new ProcessQuestionOfferStatus(value as OfferStatus);
  }

  toPrimitives(): OfferStatus {
    return this.value;
  }
}
