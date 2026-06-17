import { ValueObject } from "@/modules/shared";

export class CVChatSnapshot extends ValueObject<unknown> {
  private constructor(private readonly value: unknown) {
    super();
  }

  static fromPrimitives(value: unknown): CVChatSnapshot {
    return new CVChatSnapshot(value);
  }

  toPrimitives(): unknown {
    return this.value;
  }
}
