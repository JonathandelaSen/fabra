import type { DomainEvent } from "@/modules/shared";

export class ChatMessageCreatedEvent
  implements DomainEvent<{ messageId: string; conversationId: string; role: string }>
{
  readonly eventName = "cv_chat_message_created";
  readonly occurredAt = new Date();

  constructor(
    private readonly messageId: string,
    private readonly conversationId: string,
    private readonly role: string
  ) {}

  toPrimitives(): { messageId: string; conversationId: string; role: string } {
    return {
      messageId: this.messageId,
      conversationId: this.conversationId,
      role: this.role,
    };
  }
}
