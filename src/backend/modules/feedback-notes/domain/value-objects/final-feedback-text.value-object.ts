import { ValueObject } from "@/backend/modules/shared";

export class FinalFeedbackText extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new Error("Final feedback text cannot be empty.");
  }

  static fromPrimitives(value: string): FinalFeedbackText {
    return new FinalFeedbackText(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
