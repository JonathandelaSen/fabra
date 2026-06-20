import { ValueObject } from "@/backend/modules/shared";

export class CVChatModel extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) {
    super();
  }

  static fromPrimitives(value: string | null): CVChatModel {
    return new CVChatModel(value);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
