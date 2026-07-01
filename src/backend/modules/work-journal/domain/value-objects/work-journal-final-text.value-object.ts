import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidFinalTextError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.WORK_JOURNAL_INVALID_FINAL_TEXT, `Work journal final text cannot be empty: ${value}`, { value });
    this.name = "InvalidFinalTextError";
  }
}

export class WorkJournalFinalText extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidFinalTextError(value);
  }

  static fromPrimitives(value: string): WorkJournalFinalText {
    return new WorkJournalFinalText(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
