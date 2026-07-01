import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidTimestampError extends DomainError {
  constructor(value: string, label: string) {
    super(ErrorCode.INVALID_TIMESTAMP, `${label} cannot be empty.`, { value, label });
    this.name = "InvalidTimestampError";
  }
}

export class Timestamp extends ValueObject<string> {
  protected constructor(private readonly value: string, label: string) {
    super();
    if (!value.trim()) throw new InvalidTimestampError(value, label);
  }

  static fromPrimitives(value: string): Timestamp {
    return new Timestamp(value, "timestamp");
  }

  toPrimitives(): string {
    return this.value;
  }
}
