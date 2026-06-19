import { LongText, ValueObject } from "@/backend/modules/shared";
import { AIInteractionRating } from "./ai-interaction-rating.value-object";
import type { AIInteractionRating as AIInteractionRatingValue } from "../entities/ai-interaction-review.entity";

export interface AIInteractionReviewSummaryPrimitives {
  rating: string;
  note: string | null;
}

export class AIInteractionReviewSummary extends ValueObject<AIInteractionReviewSummaryPrimitives> {
  private constructor(
    private readonly rating: AIInteractionRating,
    private readonly note: LongText | null
  ) {
    super();
  }

  static fromPrimitives(
    primitives: AIInteractionReviewSummaryPrimitives
  ): AIInteractionReviewSummary {
    return new AIInteractionReviewSummary(
      AIInteractionRating.fromPrimitives(primitives.rating),
      primitives.note === null ? null : LongText.fromPrimitives(primitives.note)
    );
  }

  get ratingValue(): AIInteractionRatingValue {
    return this.rating.toPrimitives();
  }

  get noteValue(): string | null {
    return this.note?.toPrimitives() ?? null;
  }

  toPrimitives(): AIInteractionReviewSummaryPrimitives {
    return {
      rating: this.rating.toPrimitives(),
      note: this.note?.toPrimitives() ?? null,
    };
  }
}
