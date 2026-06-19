import { ValueObject } from "./value-object";

export class CopyPastePrivacyNotice extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) {
    super();
  }

  static fromPrimitives(value: string | null): CopyPastePrivacyNotice {
    if (value === null) return new CopyPastePrivacyNotice(null);
    const trimmed = value.trim();
    if (!trimmed) throw new Error("Copy paste privacy notice cannot be empty when present.");
    return new CopyPastePrivacyNotice(trimmed);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
