import type { DomainEvent } from "@/modules/shared";

export class ConversationRenamedEvent implements DomainEvent<{ conversationId: string }> {
  readonly eventName = "analysis_chat_conversation_renamed";
  readonly occurredAt = new Date();

  constructor(private readonly conversationId: string) {}

  toPrimitives(): { conversationId: string } {
    return { conversationId: this.conversationId };
  }
}
