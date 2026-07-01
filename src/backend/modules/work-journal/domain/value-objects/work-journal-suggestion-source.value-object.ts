import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export const workJournalSuggestionSources = {
  cv: "cv",
} as const;

export type SuggestionSource =
  (typeof workJournalSuggestionSources)[keyof typeof workJournalSuggestionSources];

class InvalidSuggestionSourceError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.WORK_JOURNAL_INVALID_SUGGESTION_SOURCE, `Invalid suggestion source: ${value}`, { value });
    this.name = "InvalidSuggestionSourceError";
  }
}


export class WorkJournalSuggestionSource extends ValueObject<SuggestionSource> {
  private constructor(private readonly value: SuggestionSource) {
    super();
  }

  static fromPrimitives(value: string): WorkJournalSuggestionSource {
    if (value !== workJournalSuggestionSources.cv) {
      throw new InvalidSuggestionSourceError(value);
    }
    return new WorkJournalSuggestionSource(value);
  }

  static cv(): WorkJournalSuggestionSource {
    return new WorkJournalSuggestionSource(workJournalSuggestionSources.cv);
  }

  isCv(): boolean {
    return this.value === workJournalSuggestionSources.cv;
  }

  toPrimitives(): SuggestionSource {
    return this.value;
  }
}
