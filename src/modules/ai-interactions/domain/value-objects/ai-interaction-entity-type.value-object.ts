import { ValueObject } from "@/modules/shared";

export class AIInteractionEntityType extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): AIInteractionEntityType {
    return new AIInteractionEntityType(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
