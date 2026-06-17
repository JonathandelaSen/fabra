import { ValueObject } from "@/modules/shared";

export class AIInteractionModule extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): AIInteractionModule {
    return new AIInteractionModule(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
