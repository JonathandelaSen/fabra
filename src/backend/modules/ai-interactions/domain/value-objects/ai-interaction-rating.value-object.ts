import { ValueObject } from "@/backend/modules/shared";
import {
  aiInteractionRatings,
  type AIInteractionRating as AIInteractionRatingValue,
} from "../entities/ai-interaction-review.entity";

export class AIInteractionRating extends ValueObject<AIInteractionRatingValue> {
  private constructor(private readonly value: AIInteractionRatingValue) {
    super();
  }

  static fromPrimitives(value: string): AIInteractionRating {
    if (!Object.values(aiInteractionRatings).includes(value as AIInteractionRatingValue)) {
      throw new Error(`Invalid AI interaction rating: ${value}`);
    }
    return new AIInteractionRating(value as AIInteractionRatingValue);
  }

  toPrimitives(): AIInteractionRatingValue {
    return this.value;
  }
}
