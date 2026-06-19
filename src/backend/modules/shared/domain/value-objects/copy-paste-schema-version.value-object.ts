import { ValueObject } from "./value-object";

export class CopyPasteSchemaVersion extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): CopyPasteSchemaVersion {
    const trimmed = value.trim();
    if (!trimmed) throw new Error("Copy paste schemaVersion cannot be empty.");
    return new CopyPasteSchemaVersion(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
