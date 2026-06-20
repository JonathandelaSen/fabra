import { Counter, LongText, StringList, ValueObject } from "@/backend/modules/shared";
import type { CVScoringAIResultPrimitives } from "../repositories/cv-scoring-ai.service";

export class CVScoringAIResult extends ValueObject<CVScoringAIResultPrimitives> {
  private constructor(
    private readonly scoreValue: Counter,
    private readonly feedbackValue: LongText,
    private readonly keywordsValue: StringList,
    private readonly improvementsValue: StringList
  ) {
    super();
  }

  static fromPrimitives(primitives: CVScoringAIResultPrimitives): CVScoringAIResult {
    return new CVScoringAIResult(
      Counter.fromPrimitives(primitives.score),
      LongText.fromPrimitives(primitives.feedback),
      StringList.fromPrimitives(primitives.keywords),
      StringList.fromPrimitives(primitives.improvements)
    );
  }

  toPrimitives(): CVScoringAIResultPrimitives {
    return {
      score: this.scoreValue.toPrimitives(),
      feedback: this.feedbackValue.toPrimitives(),
      keywords: this.keywordsValue.toPrimitives(),
      improvements: this.improvementsValue.toPrimitives(),
    };
  }
}
