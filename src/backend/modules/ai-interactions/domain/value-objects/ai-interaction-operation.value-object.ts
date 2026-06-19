import { ValueObject } from "@/backend/modules/shared";

export class AIInteractionOperation extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): AIInteractionOperation {
    return new AIInteractionOperation(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
