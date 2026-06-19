import { ValueObject } from "@/backend/modules/shared";

export class AIModelName extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): AIModelName {
    return new AIModelName(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
