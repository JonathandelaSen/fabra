import { ValueObject } from "@/modules/shared";
import type { ActivityContextType } from "../entities/activity-context.entity";
import { ActivityContextIsCurrent } from "./activity-context-is-current.value-object";
import { ActivityContextRoleOrLabel } from "./activity-context-role-or-label.value-object";
import { ActivityContextSuggestionName } from "./activity-context-suggestion-name.value-object";
import {
  ActivityContextSuggestionSource,
  type ActivityContextSuggestionSourceValue,
} from "./activity-context-suggestion-source.value-object";
import { ActivityContextSuggestionType } from "./activity-context-suggestion-type.value-object";

export interface ActivityContextSuggestionPrimitives {
  type: string;
  name: string;
  roleOrLabel: string | null;
  isCurrent: boolean;
  source: string;
}

export class ActivityContextSuggestion extends ValueObject<ActivityContextSuggestionPrimitives> {
  private constructor(
    private readonly suggestionType: ActivityContextSuggestionType,
    private readonly suggestionName: ActivityContextSuggestionName,
    private readonly suggestionRoleOrLabel: ActivityContextRoleOrLabel,
    private readonly suggestionIsCurrent: ActivityContextIsCurrent,
    private readonly suggestionSource: ActivityContextSuggestionSource
  ) {
    super();
  }

  static fromPrimitives(
    primitives: ActivityContextSuggestionPrimitives
  ): ActivityContextSuggestion {
    return new ActivityContextSuggestion(
      ActivityContextSuggestionType.fromPrimitives(primitives.type),
      ActivityContextSuggestionName.fromPrimitives(primitives.name),
      ActivityContextRoleOrLabel.fromPrimitives(primitives.roleOrLabel),
      ActivityContextIsCurrent.fromPrimitives(primitives.isCurrent),
      ActivityContextSuggestionSource.fromPrimitives(primitives.source)
    );
  }

  get type(): ActivityContextType {
    return this.suggestionType.toPrimitives();
  }

  get name(): string {
    return this.suggestionName.toPrimitives();
  }

  get roleOrLabel(): string | null {
    return this.suggestionRoleOrLabel.toPrimitives();
  }

  get isCurrent(): boolean {
    return this.suggestionIsCurrent.toPrimitives();
  }

  get source(): ActivityContextSuggestionSourceValue {
    return this.suggestionSource.toPrimitives();
  }

  toPrimitives(): ActivityContextSuggestionPrimitives {
    return {
      type: this.suggestionType.toPrimitives(),
      name: this.suggestionName.toPrimitives(),
      roleOrLabel: this.suggestionRoleOrLabel.toPrimitives(),
      isCurrent: this.suggestionIsCurrent.toPrimitives(),
      source: this.suggestionSource.toPrimitives(),
    };
  }
}
