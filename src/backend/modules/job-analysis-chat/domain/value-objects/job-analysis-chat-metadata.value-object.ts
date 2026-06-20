import { ValueObject } from "@/backend/modules/shared";

export class JobAnalysisChatMetadata extends ValueObject<Record<string, unknown> | null> {
  private constructor(private readonly value: Record<string, unknown> | null) {
    super();
  }

  static fromPrimitives(value: Record<string, unknown> | null): JobAnalysisChatMetadata {
    return new JobAnalysisChatMetadata(value ? { ...value } : null);
  }

  toPrimitives(): Record<string, unknown> | null {
    return this.value ? { ...this.value } : null;
  }
}
