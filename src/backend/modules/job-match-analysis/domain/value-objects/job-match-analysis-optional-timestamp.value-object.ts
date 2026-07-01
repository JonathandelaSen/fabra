import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidJobMatchAnalysisTimestampError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_JOB_MATCH_ANALYSIS_TIMESTAMP, "Job match analysis timestamp cannot be empty when present.", { value });
    this.name = "InvalidJobMatchAnalysisTimestampError";
  }
}

export class JobMatchAnalysisOptionalTimestamp extends ValueObject<
  string | null
> {
  private constructor(private readonly value: string | null) {
    super();
    if (value !== null && !value.trim()) {
      throw new InvalidJobMatchAnalysisTimestampError(value);
    }
  }

  static fromPrimitives(
    value: string | null,
  ): JobMatchAnalysisOptionalTimestamp {
    return new JobMatchAnalysisOptionalTimestamp(value);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
