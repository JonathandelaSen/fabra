import { ValueObject } from "@/backend/modules/shared";
import { ActivityContextSuggestionName } from "./activity-context-suggestion-name.value-object";
import { ActivityContextSuggestionType } from "./activity-context-suggestion-type.value-object";
import type { ActivityContextType } from "../entities/activity-context.entity";

export interface ActivityContextHiddenSuggestionPrimitives {
  type: string;
  name: string;
}

export class ActivityContextHiddenSuggestion extends ValueObject<ActivityContextHiddenSuggestionPrimitives> {
  private constructor(
    private readonly suggestionType: ActivityContextSuggestionType,
    private readonly suggestionName: ActivityContextSuggestionName
  ) {
    super();
  }

  static fromPrimitives(
    primitives: ActivityContextHiddenSuggestionPrimitives
  ): ActivityContextHiddenSuggestion {
    return new ActivityContextHiddenSuggestion(
      ActivityContextSuggestionType.fromPrimitives(primitives.type),
      ActivityContextSuggestionName.fromPrimitives(primitives.name)
    );
  }

  get type(): ActivityContextType {
    return this.suggestionType.toPrimitives();
  }

  get name(): string {
    return this.suggestionName.toPrimitives();
  }

  key(): string {
    return `${this.type}:${this.nameKey()}`;
  }

  nameKey(): string {
    return this.name.trim().toLowerCase().replace(/\s+/g, " ");
  }

  toPrimitives(): ActivityContextHiddenSuggestionPrimitives {
    return {
      type: this.suggestionType.toPrimitives(),
      name: this.suggestionName.toPrimitives(),
    };
  }

}
