import { ValueObject } from "@/backend/modules/shared";

export const processQuestionAnalysisModes = {
  general: "general",
  jobMatch: "job_match",
} as const;

export type ProcessQuestionAnalysisMode =
  (typeof processQuestionAnalysisModes)[keyof typeof processQuestionAnalysisModes];

export class ProcessQuestionAnalysisModeVO extends ValueObject<ProcessQuestionAnalysisMode> {
  private constructor(private readonly value: ProcessQuestionAnalysisMode) {
    super();
  }

  static fromPrimitives(value: string): ProcessQuestionAnalysisModeVO {
    if (!Object.values(processQuestionAnalysisModes).includes(value as ProcessQuestionAnalysisMode)) {
      throw new Error(`Invalid process question analysis mode: ${value}`);
    }
    return new ProcessQuestionAnalysisModeVO(value as ProcessQuestionAnalysisMode);
  }

  static general(): ProcessQuestionAnalysisModeVO {
    return new ProcessQuestionAnalysisModeVO(processQuestionAnalysisModes.general);
  }

  static jobMatch(): ProcessQuestionAnalysisModeVO {
    return new ProcessQuestionAnalysisModeVO(processQuestionAnalysisModes.jobMatch);
  }

  isGeneral(): boolean {
    return this.value === processQuestionAnalysisModes.general;
  }

  isJobMatch(): boolean {
    return this.value === processQuestionAnalysisModes.jobMatch;
  }

  toPrimitives(): ProcessQuestionAnalysisMode {
    return this.value;
  }
}
