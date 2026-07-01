import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidSuggestionKeyError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.WORK_JOURNAL_INVALID_SUGGESTION_KEY, `Work journal suggestion key cannot be empty: ${value}`, { value });
    this.name = "InvalidSuggestionKeyError";
  }
}

export class WorkJournalSuggestionKey extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidSuggestionKeyError(value);
  }



  static fromPrimitives(value: string): WorkJournalSuggestionKey {
    return new WorkJournalSuggestionKey(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
