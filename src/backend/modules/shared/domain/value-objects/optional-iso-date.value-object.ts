import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidOptionalIsoDateError extends DomainError {
  constructor(value: string, label: string) {
    super(ErrorCode.INVALID_ISO_DATE, `Invalid ${label}: ${value}`, { value, label });
    this.name = "InvalidOptionalIsoDateError";
  }
}

export class OptionalIsoDate extends ValueObject<string | null> {
  protected constructor(private readonly value: string | null, label: string) {
    super();
    if (value !== null && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new InvalidOptionalIsoDateError(value, label);
    }
  }

  static fromPrimitives(value: string | null): OptionalIsoDate {
    return new OptionalIsoDate(value, "optional ISO date");
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
