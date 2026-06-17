import { ValueObject } from "@/modules/shared";
import type { CVScoringAIResultPrimitives } from "../repositories/cv-scoring-ai.service";

export class CVScoringAIResultVO extends ValueObject<CVScoringAIResultPrimitives> {
  private constructor(private readonly value: CVScoringAIResultPrimitives) {
    super();
  }

  static fromPrimitives(primitives: CVScoringAIResultPrimitives): CVScoringAIResultVO {
    return new CVScoringAIResultVO(primitives);
  }

  toPrimitives(): CVScoringAIResultPrimitives {
    return this.value;
  }
}
