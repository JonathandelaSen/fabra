import { ValueObject } from "@/backend/modules/shared";

export class JobMatchAnalysisOptionalCounter extends ValueObject<
  number | null
> {
  private constructor(private readonly value: number | null) {
    super();
    if (value !== null && value < 0) {
      throw new Error("Job match analysis counter cannot be negative.");
    }
  }

  static fromPrimitives(value: number | null): JobMatchAnalysisOptionalCounter {
    return new JobMatchAnalysisOptionalCounter(value);
  }

  toPrimitives(): number | null {
    return this.value;
  }
}
