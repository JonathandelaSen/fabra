import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidJobMatchAnalysisCounterError extends DomainError {
  constructor(value: number) {
    super(ErrorCode.INVALID_JOB_MATCH_ANALYSIS_COUNTER, "Job match analysis counter cannot be negative.", { value });
    this.name = "InvalidJobMatchAnalysisCounterError";
  }
}

export class JobMatchAnalysisOptionalCounter extends ValueObject<
  number | null
> {
  private constructor(private readonly value: number | null) {
    super();
    if (value !== null && value < 0) {
      throw new InvalidJobMatchAnalysisCounterError(value);
    }
  }

  static fromPrimitives(value: number | null): JobMatchAnalysisOptionalCounter {
    return new JobMatchAnalysisOptionalCounter(value);
  }

  toPrimitives(): number | null {
    return this.value;
  }
}
