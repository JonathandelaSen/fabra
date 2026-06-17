import { ValueObject } from "@/modules/shared";

export class AIInteractionProvider extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): AIInteractionProvider {
    return new AIInteractionProvider(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
