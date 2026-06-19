import { EntityId } from "@/backend/modules/shared";

export class CVChatMessageId extends EntityId {
  private constructor(value: string) {
    super(value, "Analysis chat message id");
  }

  static fromPrimitives(value: string): CVChatMessageId {
    return new CVChatMessageId(value);
  }
}
