import { ValueObject } from "./value-object";

export class CopyPastePrompt extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): CopyPastePrompt {
    const trimmed = value.trim();
    if (!trimmed) throw new Error("Copy paste prompt cannot be empty.");
    return new CopyPastePrompt(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
