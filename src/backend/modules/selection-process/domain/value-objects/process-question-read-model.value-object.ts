import { ValueObject } from "@/backend/modules/shared";
import { ProcessQuestion, type ProcessQuestionPrimitives } from "../entities/process-question.entity";
import {
  ProcessQuestionRelatedCV,
  type ProcessQuestionRelatedCVPrimitives,
} from "./process-question-related-cv.value-object";
import {
  ProcessQuestionRelatedAnalysis,
  type ProcessQuestionRelatedAnalysisPrimitives,
} from "./process-question-related-analysis.value-object";

export {
  processQuestionCVTypes,
  type ProcessQuestionCVType,
} from "./process-question-cv-kind.value-object";
export {
  processQuestionAnalysisModes,
  type ProcessQuestionAnalysisMode,
} from "./process-question-analysis-mode.value-object";
export type { ProcessQuestionRelatedCVPrimitives } from "./process-question-related-cv.value-object";
export type { ProcessQuestionRelatedAnalysisPrimitives } from "./process-question-related-analysis.value-object";

export interface ProcessQuestionReadModelPrimitives {
  question: ProcessQuestionPrimitives;
  cv: ProcessQuestionRelatedCVPrimitives | null;
  analysis: ProcessQuestionRelatedAnalysisPrimitives | null;
}

export class ProcessQuestionReadModel extends ValueObject<ProcessQuestionReadModelPrimitives> {
  private constructor(
    public readonly question: ProcessQuestion,
    private readonly cvValue: ProcessQuestionRelatedCV | null,
    private readonly analysisValue: ProcessQuestionRelatedAnalysis | null
  ) {
    super();
  }

  static fromPrimitives(primitives: ProcessQuestionReadModelPrimitives): ProcessQuestionReadModel {
    return new ProcessQuestionReadModel(
      ProcessQuestion.fromPrimitives(primitives.question),
      primitives.cv === null ? null : ProcessQuestionRelatedCV.fromPrimitives(primitives.cv),
      primitives.analysis === null
        ? null
        : ProcessQuestionRelatedAnalysis.fromPrimitives(primitives.analysis)
    );
  }

  get cv(): ProcessQuestionRelatedCVPrimitives | null {
    return this.cvValue?.toPrimitives() ?? null;
  }

  get analysis(): ProcessQuestionRelatedAnalysisPrimitives | null {
    return this.analysisValue?.toPrimitives() ?? null;
  }

  toPrimitives(): ProcessQuestionReadModelPrimitives {
    return {
      question: this.question.toPrimitives(),
      cv: this.cvValue?.toPrimitives() ?? null,
      analysis: this.analysisValue?.toPrimitives() ?? null,
    };
  }
}
