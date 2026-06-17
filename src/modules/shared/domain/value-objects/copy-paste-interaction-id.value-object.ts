import { ValueObject } from "./value-object";

export class CopyPasteInteractionId extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) {
    super();
  }

  static fromPrimitives(value: string | null): CopyPasteInteractionId {
    if (value === null) return new CopyPasteInteractionId(null);
    const trimmed = value.trim();
    if (!trimmed) throw new Error("Copy paste interactionId cannot be empty when present.");
    return new CopyPasteInteractionId(trimmed);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
