import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidIsoDateError extends DomainError {
  constructor(value: string, message: string) {
    super(ErrorCode.INVALID_ISO_DATE, message, { value });
    this.name = "InvalidIsoDateError";
  }
}

export class IsoDate extends ValueObject<string> {
  protected constructor(private readonly value: string, label: string) {
    super();
    if (!value.trim()) throw new InvalidIsoDateError(value, `${label} cannot be empty.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new InvalidIsoDateError(value, `Invalid ${label}: ${value}`);
    }
  }

  static fromPrimitives(value: string): IsoDate {
    return new IsoDate(value, "ISO date");
  }

  toPrimitives(): string {
    return this.value;
  }
}
