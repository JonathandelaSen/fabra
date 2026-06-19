import { ValueObject } from "@/backend/modules/shared";
import {
  activityContextTypes,
  type ActivityContextType,
} from "../entities/activity-context.entity";

export class ActivityContextSuggestionType extends ValueObject<ActivityContextType> {
  private constructor(private readonly value: ActivityContextType) {
    super();
  }

  static fromPrimitives(value: string): ActivityContextSuggestionType {
    if (!Object.values(activityContextTypes).includes(value as ActivityContextType)) {
      throw new Error("Invalid activity context suggestion type.");
    }
    return new ActivityContextSuggestionType(value as ActivityContextType);
  }

  toPrimitives(): ActivityContextType {
    return this.value;
  }
}
