import { ValueObject } from "@/backend/modules/shared";

export class AIInteractionAssistanceMode extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): AIInteractionAssistanceMode {
    return new AIInteractionAssistanceMode(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
