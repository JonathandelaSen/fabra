import { ValueObject } from "@/backend/modules/shared";

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
      throw new Error("Invalid activity context suggestion source.");
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
