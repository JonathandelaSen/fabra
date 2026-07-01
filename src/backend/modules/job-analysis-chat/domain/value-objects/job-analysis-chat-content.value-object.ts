import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidJobAnalysisChatContentError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_JOB_ANALYSIS_CHAT_CONTENT, "Analysis chat content cannot be empty.", { value });
    this.name = "InvalidJobAnalysisChatContentError";
  }
}

export class JobAnalysisChatContent extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim())
      throw new InvalidJobAnalysisChatContentError(value);
  }

  static fromPrimitives(value: string): JobAnalysisChatContent {
    return new JobAnalysisChatContent(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
