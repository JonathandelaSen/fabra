import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidDraftError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.WORK_JOURNAL_INVALID_DRAFT, `Work journal draft cannot be empty: ${value}`, { value });
    this.name = "InvalidDraftError";
  }
}

export class WorkJournalDraft extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidDraftError(value);
  }

  static fromPrimitives(value: string): WorkJournalDraft {
    return new WorkJournalDraft(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
