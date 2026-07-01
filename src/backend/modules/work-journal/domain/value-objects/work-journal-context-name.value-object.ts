import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidContextNameError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.WORK_JOURNAL_INVALID_CONTEXT_NAME, `Work journal context name cannot be empty: ${value}`, { value });
    this.name = "InvalidContextNameError";
  }
}

export class WorkJournalContextName extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidContextNameError(value);
  }

  static fromPrimitives(value: string): WorkJournalContextName {
    return new WorkJournalContextName(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
