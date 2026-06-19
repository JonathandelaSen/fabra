import { EntityId } from "@/modules/shared";

export class CVChatConversationId extends EntityId {
  private constructor(value: string) {
    super(value, "Analysis chat conversation id");
  }

  static fromPrimitives(value: string): CVChatConversationId {
    return new CVChatConversationId(value);
  }
}
