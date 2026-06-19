import { ValueObject } from "@/backend/modules/shared";

export class JobAnalysisChatSnapshot extends ValueObject<unknown> {
  private constructor(private readonly value: unknown) {
    super();
  }

  static fromPrimitives(value: unknown): JobAnalysisChatSnapshot {
    return new JobAnalysisChatSnapshot(value);
  }

  toPrimitives(): unknown {
    return this.value;
  }
}
