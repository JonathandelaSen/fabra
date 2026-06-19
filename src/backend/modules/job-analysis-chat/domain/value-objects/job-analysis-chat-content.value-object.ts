import { ValueObject } from "@/backend/modules/shared";

export class JobAnalysisChatContent extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim())
      throw new Error("Analysis chat content cannot be empty.");
  }

  static fromPrimitives(value: string): JobAnalysisChatContent {
    return new JobAnalysisChatContent(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
