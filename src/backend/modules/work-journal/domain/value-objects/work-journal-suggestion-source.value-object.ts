import { ValueObject } from "@/modules/shared";

export const workJournalSuggestionSources = {
  cv: "cv",
} as const;

export type SuggestionSource =
  (typeof workJournalSuggestionSources)[keyof typeof workJournalSuggestionSources];

export class WorkJournalSuggestionSource extends ValueObject<SuggestionSource> {
  private constructor(private readonly value: SuggestionSource) {
    super();
  }

  static fromPrimitives(value: string): WorkJournalSuggestionSource {
    if (value !== workJournalSuggestionSources.cv) {
      throw new Error(`Invalid suggestion source: ${value}`);
    }
    return new WorkJournalSuggestionSource(value);
  }

  toPrimitives(): SuggestionSource {
    return this.value;
  }
}
