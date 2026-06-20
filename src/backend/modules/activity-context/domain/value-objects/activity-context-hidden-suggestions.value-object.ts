import { ValueObject } from "@/backend/modules/shared";
import {
  ActivityContextHiddenSuggestion,
  type ActivityContextHiddenSuggestionPrimitives,
} from "./activity-context-hidden-suggestion.value-object";

export interface ActivityContextHiddenSuggestionsPrimitives {
  suggestions: ActivityContextHiddenSuggestionPrimitives[];
}

export class ActivityContextHiddenSuggestions extends ValueObject<ActivityContextHiddenSuggestionsPrimitives> {
  private constructor(
    private readonly suggestions: readonly ActivityContextHiddenSuggestion[]
  ) {
    super();
  }

  static fromPrimitives(
    primitives: ActivityContextHiddenSuggestionsPrimitives
  ): ActivityContextHiddenSuggestions {
    return new ActivityContextHiddenSuggestions(
      primitives.suggestions.map((suggestion) =>
        ActivityContextHiddenSuggestion.fromPrimitives(suggestion)
      )
    );
  }

  has(suggestion: ActivityContextHiddenSuggestion): boolean {
    return this.keys().has(suggestion.key());
  }

  toPrimitives(): ActivityContextHiddenSuggestionsPrimitives {
    return {
      suggestions: this.suggestions.map((suggestion) => suggestion.toPrimitives()),
    };
  }

  private keys(): Set<string> {
    return new Set(this.suggestions.map((suggestion) => suggestion.key()));
  }
}
