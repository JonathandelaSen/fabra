import { ValueObject } from "@/modules/shared";

export class AIInteractionModel extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): AIInteractionModel {
    return new AIInteractionModel(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
