import { ValueObject } from "@/backend/modules/shared";

export class AIInteractionStatus extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): AIInteractionStatus {
    return new AIInteractionStatus(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
