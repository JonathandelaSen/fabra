import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidCopyPasteSchemaVersionError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_COPY_PASTE_SCHEMA_VERSION, `Copy paste schemaVersion cannot be empty.`, { value });
    this.name = "InvalidCopyPasteSchemaVersionError";
  }
}

export class CopyPasteSchemaVersion extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): CopyPasteSchemaVersion {
    const trimmed = value.trim();
    if (!trimmed) throw new InvalidCopyPasteSchemaVersionError(value);
    return new CopyPasteSchemaVersion(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
