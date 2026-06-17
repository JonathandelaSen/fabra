import { ValueObject } from "@/modules/shared";

export interface JobMatchScorePreviewStatsPrimitives {
  score: number;
  summary: string;
  matchingKeywordsCount: number;
  missingKeywordsCount: number;
  jobKeywordsCount: number;
  recommendationsCount: number;
  originLabel: "external_chat";
  willReplaceExistingResult: boolean;
}

export class JobMatchScorePreviewStats extends ValueObject<JobMatchScorePreviewStatsPrimitives> {
  private constructor(private readonly value: JobMatchScorePreviewStatsPrimitives) {
    super();
  }

  static fromPrimitives(primitives: JobMatchScorePreviewStatsPrimitives): JobMatchScorePreviewStats {
    return new JobMatchScorePreviewStats(primitives);
  }

  toPrimitives(): JobMatchScorePreviewStatsPrimitives {
    return this.value;
  }
}
