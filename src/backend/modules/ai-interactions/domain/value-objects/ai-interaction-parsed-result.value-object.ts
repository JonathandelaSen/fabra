import { ValueObject } from "@/modules/shared";

export class AIInteractionParsedResult extends ValueObject<unknown> {
  private constructor(private readonly value: unknown) {
    super();
  }

  static fromPrimitives(value: unknown): AIInteractionParsedResult {
    return new AIInteractionParsedResult(value);
  }

  toPrimitives(): unknown {
    return this.value;
  }
}
