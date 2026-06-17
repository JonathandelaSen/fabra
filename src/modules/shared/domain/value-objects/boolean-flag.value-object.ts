import { ValueObject } from "./value-object";

export class BooleanFlag extends ValueObject<boolean> {
  private constructor(private readonly value: boolean) {
    super();
  }

  static fromPrimitives(value: boolean): BooleanFlag {
    return new BooleanFlag(value);
  }

  toPrimitives(): boolean {
    return this.value;
  }
}
