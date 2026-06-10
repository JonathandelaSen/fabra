import { ValueObject } from "@/modules/shared";
import type { ProcessQuestion } from "../entities/process-question.entity";

export interface ProcessQuestionRelatedCVPrimitives {
  id: string;
  name: string;
  filename: string | null;
  type: "uploaded" | "template";
}

export interface ProcessQuestionRelatedAnalysisPrimitives {
  id: string;
  cv_id: string | null;
  title: string;
  filename: string;
  analysis_mode: "general" | "job_match";
  job_url: string | null;
  offer_status:
    | "interesting"
    | "applied"
    | "interview"
    | "offer"
    | "rejected"
    | "discarded"
    | null;
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
