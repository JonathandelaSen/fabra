import { EntityId, LongText, ValueObject } from "@/backend/modules/shared";
import {
  ProcessQuestionAnalysisModeVO,
  type ProcessQuestionAnalysisMode,
} from "./process-question-analysis-mode.value-object";
import { ProcessQuestionOfferStatus } from "./process-question-offer-status.value-object";

export interface ProcessQuestionRelatedAnalysisPrimitives {
  id: string;
  cv_id: string | null;
  title: string;
  filename: string;
  analysis_mode: string;
  job_url: string | null;
  offer_status: string | null;
}

export class ProcessQuestionRelatedAnalysis extends ValueObject<ProcessQuestionRelatedAnalysisPrimitives> {
  private constructor(
    private readonly idValue: EntityId,
    private readonly cvIdValue: EntityId | null,
    private readonly titleValue: LongText,
    private readonly filenameValue: LongText,
    private readonly analysisModeValue: ProcessQuestionAnalysisModeVO,
    private readonly jobUrlValue: LongText | null,
    private readonly offerStatusValue: ProcessQuestionOfferStatus | null
  ) {
    super();
  }

  static fromPrimitives(
    primitives: ProcessQuestionRelatedAnalysisPrimitives
  ): ProcessQuestionRelatedAnalysis {
    return new ProcessQuestionRelatedAnalysis(
      EntityId.fromPrimitives(primitives.id),
      primitives.cv_id === null ? null : EntityId.fromPrimitives(primitives.cv_id),
      LongText.fromPrimitives(primitives.title),
      LongText.fromPrimitives(primitives.filename),
      ProcessQuestionAnalysisModeVO.fromPrimitives(primitives.analysis_mode),
      primitives.job_url === null ? null : LongText.fromPrimitives(primitives.job_url),
      primitives.offer_status === null ? null : ProcessQuestionOfferStatus.fromPrimitives(primitives.offer_status)
    );
  }

  get analysisMode(): ProcessQuestionAnalysisMode {
    return this.analysisModeValue.toPrimitives();
  }

  toPrimitives(): ProcessQuestionRelatedAnalysisPrimitives {
    return {
      id: this.idValue.toPrimitives(),
      cv_id: this.cvIdValue?.toPrimitives() ?? null,
      title: this.titleValue.toPrimitives(),
      filename: this.filenameValue.toPrimitives(),
      analysis_mode: this.analysisModeValue.toPrimitives(),
      job_url: this.jobUrlValue?.toPrimitives() ?? null,
      offer_status: this.offerStatusValue?.toPrimitives() ?? null,
    };
  }
}
