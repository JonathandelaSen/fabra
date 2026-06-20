import { ValueObject } from "./value-object";

export class OptionalTimestamp extends ValueObject<string | null> {
  protected constructor(private readonly value: string | null, label: string) {
    super();
    if (value !== null && !value.trim()) {
      throw new Error(`${label} cannot be empty.`);
    }
  }

  static fromPrimitives(value: string | null): OptionalTimestamp {
    return new OptionalTimestamp(value, "optional timestamp");
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
