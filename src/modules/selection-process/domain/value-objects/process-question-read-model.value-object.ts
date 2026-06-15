import { ValueObject } from "@/modules/shared";
import type { ProcessQuestion } from "../entities/process-question.entity";
import { type OfferStatus } from "@/lib/analysis-types";

export const processQuestionCVTypes = {
  uploaded: "uploaded",
  template: "template",
} as const;

export const processQuestionAnalysisModes = {
  general: "general",
  jobMatch: "job_match",
} as const;

export type ProcessQuestionCVType =
  (typeof processQuestionCVTypes)[keyof typeof processQuestionCVTypes];
export type ProcessQuestionAnalysisMode =
  (typeof processQuestionAnalysisModes)[keyof typeof processQuestionAnalysisModes];

export interface ProcessQuestionRelatedCVPrimitives {
  id: string;
  name: string;
  filename: string | null;
  type: ProcessQuestionCVType;
}

export interface ProcessQuestionRelatedAnalysisPrimitives {
  id: string;
  cv_id: string | null;
  title: string;
  filename: string;
  analysis_mode: ProcessQuestionAnalysisMode;
  job_url: string | null;
  offer_status: OfferStatus | null;
}

export interface ProcessQuestionReadModelPrimitives {
  question: ProcessQuestion;
  cv: ProcessQuestionRelatedCVPrimitives | null;
  analysis: ProcessQuestionRelatedAnalysisPrimitives | null;
}

export class ProcessQuestionReadModel extends ValueObject<ProcessQuestionReadModelPrimitives> {
  private constructor(
    public readonly question: ProcessQuestion,
    public readonly cv: ProcessQuestionRelatedCVPrimitives | null,
    public readonly analysis: ProcessQuestionRelatedAnalysisPrimitives | null
  ) {
    super();
  }

  static fromPrimitives(primitives: ProcessQuestionReadModelPrimitives): ProcessQuestionReadModel {
    return new ProcessQuestionReadModel(primitives.question, primitives.cv, primitives.analysis);
  }

  toPrimitives(): ProcessQuestionReadModelPrimitives {
    return {
      question: this.question,
      cv: this.cv,
      analysis: this.analysis,
    };
  }
}
