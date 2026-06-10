import type { DomainEvent } from "@/modules/shared";

export class ConversationDeletedEvent implements DomainEvent<{ conversationId: string }> {
  readonly eventName = "analysis_chat_conversation_deleted";
  readonly occurredAt = new Date();

  constructor(private readonly conversationId: string) {}

  toPrimitives(): { conversationId: string } {
    return { conversationId: this.conversationId };
  }
}
