import { ValueObject } from "@/modules/shared";

export class CVChatTitle extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new Error("Analysis chat title cannot be empty.");
  }

  static fromPrimitives(value: string): CVChatTitle {
    return new CVChatTitle(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
