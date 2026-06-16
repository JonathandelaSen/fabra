import { ValueObject } from "./value-object";

export class ExecutionResult extends ValueObject<boolean> {
  private constructor(private readonly value: boolean) {
    super();
  }

  static fromPrimitives(value: boolean): ExecutionResult {
    return new ExecutionResult(value);
  }

  static ok(): ExecutionResult {
    return new ExecutionResult(true);
  }

  static fail(): ExecutionResult {
    return new ExecutionResult(false);
  }

  toPrimitives(): boolean {
    return this.value;
  }
}
