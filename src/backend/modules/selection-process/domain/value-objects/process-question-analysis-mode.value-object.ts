import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export const processQuestionAnalysisModes = {
  general: "general",
  jobMatch: "job_match",
} as const;

export type ProcessQuestionAnalysisMode =
  (typeof processQuestionAnalysisModes)[keyof typeof processQuestionAnalysisModes];

class InvalidProcessQuestionAnalysisModeError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_PROCESS_QUESTION_ANALYSIS_MODE, `Invalid process question analysis mode: ${value}`, { value });
    this.name = "InvalidProcessQuestionAnalysisModeError";
  }
}

export class ProcessQuestionAnalysisModeVO extends ValueObject<ProcessQuestionAnalysisMode> {
  private constructor(private readonly value: ProcessQuestionAnalysisMode) {
    super();
  }

  static fromPrimitives(value: string): ProcessQuestionAnalysisModeVO {
    if (!Object.values(processQuestionAnalysisModes).includes(value as ProcessQuestionAnalysisMode)) {
      throw new InvalidProcessQuestionAnalysisModeError(value);
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
