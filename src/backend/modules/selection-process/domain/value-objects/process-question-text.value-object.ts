import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidProcessQuestionTextError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_PROCESS_QUESTION_TEXT, "Process question text is required", { value });
    this.name = "InvalidProcessQuestionTextError";
  }
}

export class ProcessQuestionText extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidProcessQuestionTextError(value);
  }

  static fromPrimitives(value: string): ProcessQuestionText {
    return new ProcessQuestionText(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
