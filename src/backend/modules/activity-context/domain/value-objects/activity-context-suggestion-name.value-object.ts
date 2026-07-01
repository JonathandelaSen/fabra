import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
export class InvalidActivityContextSuggestionNameError extends DomainError {
  constructor(value: string) { super(ErrorCode.INVALID_ACTIVITY_CONTEXT_SUGGESTION_NAME, "Activity context suggestion name cannot be empty.", { value }); this.name = "InvalidActivityContextSuggestionNameError"; }
}

export class ActivityContextSuggestionName extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): ActivityContextSuggestionName {
    const name = value.trim();
    if (!name) throw new InvalidActivityContextSuggestionNameError(value);
    return new ActivityContextSuggestionName(name);
  }

  toPrimitives(): string {
    return this.value;
  }
}
