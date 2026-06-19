import {
  BooleanFlag,
  Counter,
  CopyPasteOriginLabel,
  LongText,
  ValueObject,
} from "@/backend/modules/shared";

export interface CVScoreCopyPastePreviewPrimitives {
  score: number;
  summary: string;
  strengthsCount: number;
  improvementAreasCount: number;
  recommendationsCount: number;
  originLabel: "external_chat";
  willReplaceExistingResult: boolean;
}

export class CVScoreCopyPastePreview extends ValueObject<CVScoreCopyPastePreviewPrimitives> {
  private constructor(
    private readonly scoreValue: Counter,
    private readonly summaryValue: LongText,
    private readonly strengthsCountValue: Counter,
    private readonly improvementAreasCountValue: Counter,
    private readonly recommendationsCountValue: Counter,
    private readonly originLabelValue: CopyPasteOriginLabel,
    private readonly willReplaceExistingResultValue: BooleanFlag
  ) {
    super();
  }

  static fromPrimitives(primitives: CVScoreCopyPastePreviewPrimitives): CVScoreCopyPastePreview {
    return new CVScoreCopyPastePreview(
      Counter.fromPrimitives(primitives.score),
      LongText.fromPrimitives(primitives.summary),
      Counter.fromPrimitives(primitives.strengthsCount),
      Counter.fromPrimitives(primitives.improvementAreasCount),
      Counter.fromPrimitives(primitives.recommendationsCount),
      CopyPasteOriginLabel.fromPrimitives(primitives.originLabel),
      BooleanFlag.fromPrimitives(primitives.willReplaceExistingResult)
    );
  }

  toPrimitives(): CVScoreCopyPastePreviewPrimitives {
    return {
      score: this.scoreValue.toPrimitives(),
      summary: this.summaryValue.toPrimitives(),
      strengthsCount: this.strengthsCountValue.toPrimitives(),
      improvementAreasCount: this.improvementAreasCountValue.toPrimitives(),
      recommendationsCount: this.recommendationsCountValue.toPrimitives(),
      originLabel: this.originLabelValue.toPrimitives(),
      willReplaceExistingResult: this.willReplaceExistingResultValue.toPrimitives(),
    };
  }
}
