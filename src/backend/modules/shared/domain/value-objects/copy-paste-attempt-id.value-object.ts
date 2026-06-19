import { ValueObject } from "./value-object";

export class CopyPasteAttemptId extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) {
    super();
  }

  static fromPrimitives(value: string | null): CopyPasteAttemptId {
    if (value === null) return new CopyPasteAttemptId(null);
    const trimmed = value.trim();
    if (!trimmed) throw new Error("Copy paste attemptId cannot be empty when present.");
    return new CopyPasteAttemptId(trimmed);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
