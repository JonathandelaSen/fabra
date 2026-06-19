import { ValueObject } from "@/backend/modules/shared";

export class CVChatContent extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim())
      throw new Error("Analysis chat content cannot be empty.");
  }

  static fromPrimitives(value: string): CVChatContent {
    return new CVChatContent(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
