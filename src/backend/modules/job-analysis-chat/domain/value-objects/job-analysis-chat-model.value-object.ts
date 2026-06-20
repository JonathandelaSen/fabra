import { ValueObject } from "@/backend/modules/shared";

export class JobAnalysisChatModel extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) {
    super();
  }

  static fromPrimitives(value: string | null): JobAnalysisChatModel {
    return new JobAnalysisChatModel(value);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
