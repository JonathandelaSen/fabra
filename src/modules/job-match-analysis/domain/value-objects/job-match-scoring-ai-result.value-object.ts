import { ValueObject } from "@/modules/shared";
import type { JobMatchScoringAIResultPrimitives } from "../repositories/job-match-scoring-ai.service";

export class JobMatchScoringAIResultVO extends ValueObject<JobMatchScoringAIResultPrimitives> {
  private constructor(private readonly value: JobMatchScoringAIResultPrimitives) {
    super();
  }

  static fromPrimitives(primitives: JobMatchScoringAIResultPrimitives): JobMatchScoringAIResultVO {
    return new JobMatchScoringAIResultVO(primitives);
  }

  toPrimitives(): JobMatchScoringAIResultPrimitives {
    return this.value;
  }
}
