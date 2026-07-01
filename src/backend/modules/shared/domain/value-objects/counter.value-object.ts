import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidCounterError extends DomainError {
  constructor(value: number) {
    super(ErrorCode.INVALID_COUNTER, `Counter value cannot be negative.`, { value });
    this.name = "InvalidCounterError";
  }
}

export class Counter extends ValueObject<number> {
  private constructor(private readonly value: number) {
    super();
    if (value < 0) {
      throw new InvalidCounterError(value);
    }
  }

  static fromPrimitives(value: number): Counter {
    return new Counter(value);
  }

  toPrimitives(): number {
    return this.value;
  }
}
