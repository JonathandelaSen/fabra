import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
export class InvalidActivityContextSuggestionSourceError extends DomainError {
  constructor(value: string) { super(ErrorCode.INVALID_ACTIVITY_CONTEXT_SUGGESTION_SOURCE, `Invalid activity context suggestion source: ${value}`, { value }); this.name = "InvalidActivityContextSuggestionSourceError"; }
}

export const activityContextSuggestionSources = {
  cv: "cv",
} as const;

export type ActivityContextSuggestionSourceValue =
  (typeof activityContextSuggestionSources)[keyof typeof activityContextSuggestionSources];

export class ActivityContextSuggestionSource extends ValueObject<ActivityContextSuggestionSourceValue> {
  private constructor(private readonly value: ActivityContextSuggestionSourceValue) {
    super();
  }

  static fromPrimitives(value: string): ActivityContextSuggestionSource {
    if (value !== activityContextSuggestionSources.cv) {
      throw new InvalidActivityContextSuggestionSourceError(value);
    }
    return new ActivityContextSuggestionSource(value);
  }

  static cv(): ActivityContextSuggestionSource {
    return new ActivityContextSuggestionSource(activityContextSuggestionSources.cv);
  }

  isCv(): boolean {
    return this.value === activityContextSuggestionSources.cv;
  }

  toPrimitives(): ActivityContextSuggestionSourceValue {
    return this.value;
  }
}
