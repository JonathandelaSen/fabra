import { UserId } from "@/modules/shared";
import type { ChatMessage } from "../../domain/entities/chat-message.entity";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import { JobAnalysisChatConversationId } from "../../domain/value-objects/job-analysis-chat-conversation-id.value-object";

export interface ListMessagesInput {
  userId: string;
  conversationId: string;
}

export class ListMessagesUseCase {
  constructor(private readonly deps: { messageRepo: ChatMessageRepository }) {}

  async execute(input: ListMessagesInput): Promise<ChatMessage[]> {
    return this.deps.messageRepo.search({
      userId: UserId.fromPrimitives(input.userId),
      conversationId: JobAnalysisChatConversationId.fromPrimitives(
        input.conversationId,
      ),
    });
  }
}
