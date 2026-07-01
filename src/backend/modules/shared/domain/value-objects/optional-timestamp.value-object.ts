import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidOptionalTimestampError extends DomainError {
  constructor(value: string, label: string) {
    super(ErrorCode.INVALID_TIMESTAMP, `${label} cannot be empty.`, { value, label });
    this.name = "InvalidOptionalTimestampError";
  }
}

export class OptionalTimestamp extends ValueObject<string | null> {
  protected constructor(private readonly value: string | null, label: string) {
    super();
    if (value !== null && !value.trim()) {
      throw new InvalidOptionalTimestampError(value, label);
    }
  }

  static fromPrimitives(value: string | null): OptionalTimestamp {
    return new OptionalTimestamp(value, "optional timestamp");
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
