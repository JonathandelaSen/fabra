import { ValueObject } from "@/backend/modules/shared";

export class JobMatchAnalysisOptionalText extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) {
    super();
  }

  static fromPrimitives(value: string | null): JobMatchAnalysisOptionalText {
    return new JobMatchAnalysisOptionalText(value);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
