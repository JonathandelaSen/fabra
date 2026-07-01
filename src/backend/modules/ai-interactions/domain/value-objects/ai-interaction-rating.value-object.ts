import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import {
  aiInteractionRatings,
  type AIInteractionRating as AIInteractionRatingValue,
} from "../entities/ai-interaction-review.entity";
export class InvalidAIInteractionRatingError extends DomainError {
  constructor(value: string) { super(ErrorCode.INVALID_AI_INTERACTION_RATING, `Invalid AI interaction rating: ${value}`, { value }); this.name = "InvalidAIInteractionRatingError"; }
}

export class AIInteractionRating extends ValueObject<AIInteractionRatingValue> {
  private constructor(private readonly value: AIInteractionRatingValue) {
    super();
  }

  static fromPrimitives(value: string): AIInteractionRating {
    if (!Object.values(aiInteractionRatings).includes(value as AIInteractionRatingValue)) {
      throw new InvalidAIInteractionRatingError(value);
    }
    return new AIInteractionRating(value as AIInteractionRatingValue);
  }

  toPrimitives(): AIInteractionRatingValue {
    return this.value;
  }
}
