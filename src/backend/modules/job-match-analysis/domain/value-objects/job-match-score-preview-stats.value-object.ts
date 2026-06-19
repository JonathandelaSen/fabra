import {
  BooleanFlag,
  Counter,
  CopyPasteOriginLabel,
  LongText,
  ValueObject,
} from "@/modules/shared";

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
  private constructor(
    private readonly scoreValue: Counter,
    private readonly summaryValue: LongText,
    private readonly matchingKeywordsCountValue: Counter,
    private readonly missingKeywordsCountValue: Counter,
    private readonly jobKeywordsCountValue: Counter,
    private readonly recommendationsCountValue: Counter,
    private readonly originLabelValue: CopyPasteOriginLabel,
    private readonly willReplaceExistingResultValue: BooleanFlag
  ) {
    super();
  }

  static fromPrimitives(primitives: JobMatchScorePreviewStatsPrimitives): JobMatchScorePreviewStats {
    return new JobMatchScorePreviewStats(
      Counter.fromPrimitives(primitives.score),
      LongText.fromPrimitives(primitives.summary),
      Counter.fromPrimitives(primitives.matchingKeywordsCount),
      Counter.fromPrimitives(primitives.missingKeywordsCount),
      Counter.fromPrimitives(primitives.jobKeywordsCount),
      Counter.fromPrimitives(primitives.recommendationsCount),
      CopyPasteOriginLabel.fromPrimitives(primitives.originLabel),
      BooleanFlag.fromPrimitives(primitives.willReplaceExistingResult)
    );
  }

  toPrimitives(): JobMatchScorePreviewStatsPrimitives {
    return {
      score: this.scoreValue.toPrimitives(),
      summary: this.summaryValue.toPrimitives(),
      matchingKeywordsCount: this.matchingKeywordsCountValue.toPrimitives(),
      missingKeywordsCount: this.missingKeywordsCountValue.toPrimitives(),
      jobKeywordsCount: this.jobKeywordsCountValue.toPrimitives(),
      recommendationsCount: this.recommendationsCountValue.toPrimitives(),
      originLabel: this.originLabelValue.toPrimitives(),
      willReplaceExistingResult: this.willReplaceExistingResultValue.toPrimitives(),
    };
  }
}
