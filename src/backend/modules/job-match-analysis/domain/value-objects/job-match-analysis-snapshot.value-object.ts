import { ValueObject } from "@/backend/modules/shared";

export class JobMatchAnalysisSnapshot extends ValueObject<unknown | null> {
  private constructor(private readonly value: unknown | null) {
    super();
  }

  static fromPrimitives(value: unknown | null): JobMatchAnalysisSnapshot {
    return new JobMatchAnalysisSnapshot(value);
  }

  withJobUrl(jobUrl: string | null): JobMatchAnalysisSnapshot {
    const snapshot =
      this.value && typeof this.value === "object"
        ? { ...(this.value as Record<string, unknown>) }
        : {};
    return new JobMatchAnalysisSnapshot({ ...snapshot, url: jobUrl });
  }

  toPrimitives(): unknown | null {
    return this.value;
  }
}
