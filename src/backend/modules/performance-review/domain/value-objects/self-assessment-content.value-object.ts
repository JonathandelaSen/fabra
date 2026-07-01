import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidSelfAssessmentContentError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_SELF_ASSESSMENT_CONTENT, "Self-assessment content cannot be empty.", { value });
    this.name = "InvalidSelfAssessmentContentError";
  }
}

export class SelfAssessmentContent extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim())
      throw new InvalidSelfAssessmentContentError(value);
  }

  static fromPrimitives(value: string): SelfAssessmentContent {
    return new SelfAssessmentContent(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
