import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidOpportunityPersonNameError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_OPPORTUNITY_PERSON_NAME, "Opportunity person name is required", { value });
    this.name = "InvalidOpportunityPersonNameError";
  }
}

export class OpportunityPersonName extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidOpportunityPersonNameError(value);
  }

  static fromPrimitives(value: string): OpportunityPersonName {
    return new OpportunityPersonName(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
