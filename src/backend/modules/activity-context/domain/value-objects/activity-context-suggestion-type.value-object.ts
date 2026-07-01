import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import {
  activityContextTypes,
  type ActivityContextType,
} from "../entities/activity-context.entity";
export class InvalidActivityContextSuggestionTypeError extends DomainError {
  constructor(value: string) { super(ErrorCode.INVALID_ACTIVITY_CONTEXT_SUGGESTION_TYPE, `Invalid activity context suggestion type: ${value}`, { value }); this.name = "InvalidActivityContextSuggestionTypeError"; }
}

export class ActivityContextSuggestionType extends ValueObject<ActivityContextType> {
  private constructor(private readonly value: ActivityContextType) {
    super();
  }

  static fromPrimitives(value: string): ActivityContextSuggestionType {
    if (!Object.values(activityContextTypes).includes(value as ActivityContextType)) {
      throw new InvalidActivityContextSuggestionTypeError(value);
    }
    return new ActivityContextSuggestionType(value as ActivityContextType);
  }

  toPrimitives(): ActivityContextType {
    return this.value;
  }
}
