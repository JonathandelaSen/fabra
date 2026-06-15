import { ValueObject } from "@/modules/shared";
import {
  activityContextTypes,
  type ActivityContextType,
} from "../entities/activity-context.entity";

export const activityContextSuggestionSources = {
  cv: "cv",
} as const;

export type ActivityContextSuggestionSource =
  (typeof activityContextSuggestionSources)[keyof typeof activityContextSuggestionSources];

export interface ActivityContextSuggestionPrimitives {
  type: ActivityContextType;
  name: string;
  roleOrLabel: string | null;
  isCurrent: boolean;
  source: ActivityContextSuggestionSource;
}

export class ActivityContextSuggestion extends ValueObject<ActivityContextSuggestionPrimitives> {
  private constructor(private readonly state: ActivityContextSuggestionPrimitives) {
    super();
  }

  static fromPrimitives(
    primitives: ActivityContextSuggestionPrimitives
  ): ActivityContextSuggestion {
    const name = primitives.name.trim();
    if (!name) throw new Error("Activity context suggestion name cannot be empty.");
    if (!Object.values(activityContextTypes).includes(primitives.type)) {
      throw new Error("Invalid activity context suggestion type.");
    }
    if (primitives.source !== activityContextSuggestionSources.cv) {
      throw new Error("Invalid activity context suggestion source.");
    }
    return new ActivityContextSuggestion({
      ...primitives,
      name,
      roleOrLabel: primitives.roleOrLabel?.trim() || null,
    });
  }

  get type(): ActivityContextType {
    return this.state.type;
  }

  get name(): string {
    return this.state.name;
  }

  get roleOrLabel(): string | null {
    return this.state.roleOrLabel;
  }

  get isCurrent(): boolean {
    return this.state.isCurrent;
  }

  toPrimitives(): ActivityContextSuggestionPrimitives {
    return { ...this.state };
  }
}
