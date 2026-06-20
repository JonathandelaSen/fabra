import { ValueObject } from "@/backend/modules/shared";

export class InterviewAnswer extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new Error("Interview answer cannot be empty.");
  }

  static fromPrimitives(value: string): InterviewAnswer {
    return new InterviewAnswer(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
