import { ValueObject } from "@/backend/modules/shared";

export class JobMatchAnalysisOptionalTimestamp extends ValueObject<
  string | null
> {
  private constructor(private readonly value: string | null) {
    super();
    if (value !== null && !value.trim()) {
      throw new Error(
        "Job match analysis timestamp cannot be empty when present.",
      );
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
