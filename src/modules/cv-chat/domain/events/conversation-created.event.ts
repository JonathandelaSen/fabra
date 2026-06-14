import type { DomainEvent } from "@/modules/shared";

export class ConversationCreatedEvent implements DomainEvent<{ conversationId: string }> {
  readonly eventName = "cv_chat_conversation_created";
  readonly occurredAt = new Date();

  constructor(private readonly conversationId: string) {}

  toPrimitives(): { conversationId: string } {
    return { conversationId: this.conversationId };
  }
}
