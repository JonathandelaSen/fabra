import { ValueObject } from "./value-object";

export class Counter extends ValueObject<number> {
  private constructor(private readonly value: number) {
    super();
    if (value < 0) {
      throw new Error("Counter value cannot be negative.");
    }
  }

  static fromPrimitives(value: number): Counter {
    return new Counter(value);
  }

  toPrimitives(): number {
    return this.value;
  }
}
