import { ValueObject } from "./value-object";

export class LongText extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): LongText {
    return new LongText(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
