import { ValueObject } from "@/backend/modules/shared";

export class JobAnalysisChatTitle extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new Error("Analysis chat title cannot be empty.");
  }

  static fromPrimitives(value: string): JobAnalysisChatTitle {
    return new JobAnalysisChatTitle(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
