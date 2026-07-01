import { ValueObject, DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidNotesError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.WORK_JOURNAL_INVALID_NOTES, `Work journal notes cannot be empty: ${value}`, { value });
    this.name = "InvalidNotesError";
  }
}

export class WorkJournalNotes extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidNotesError(value);
  }

  static fromPrimitives(value: string): WorkJournalNotes {
    return new WorkJournalNotes(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
