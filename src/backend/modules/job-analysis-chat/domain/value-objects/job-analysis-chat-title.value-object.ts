import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidJobAnalysisChatTitleError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_JOB_ANALYSIS_CHAT_TITLE, "Analysis chat title cannot be empty.", { value });
    this.name = "InvalidJobAnalysisChatTitleError";
  }
}

export class JobAnalysisChatTitle extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidJobAnalysisChatTitleError(value);
  }

  static fromPrimitives(value: string): JobAnalysisChatTitle {
    return new JobAnalysisChatTitle(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
