import { ValueObject } from "@/backend/modules/shared";

export class SelfAssessmentContent extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim())
      throw new Error("Self-assessment content cannot be empty.");
  }

  static fromPrimitives(value: string): SelfAssessmentContent {
    return new SelfAssessmentContent(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
