import { ValueObject } from "@/modules/shared";
import { ChatMessage, type ChatMessagePrimitives } from "../entities/chat-message.entity";

export interface CVChatMessagePairPrimitives {
  userMessage: ChatMessagePrimitives;
  assistantMessage: ChatMessagePrimitives;
}

export class CVChatMessagePair extends ValueObject<CVChatMessagePairPrimitives> {
  private constructor(
    private readonly userMsg: ChatMessage,
    private readonly assistantMsg: ChatMessage
  ) {
    super();
  }

  static create(userMessage: ChatMessage, assistantMessage: ChatMessage): CVChatMessagePair {
    return new CVChatMessagePair(userMessage, assistantMessage);
  }

  static fromPrimitives(primitives: CVChatMessagePairPrimitives): CVChatMessagePair {
    return new CVChatMessagePair(
      ChatMessage.fromPrimitives(primitives.userMessage),
      ChatMessage.fromPrimitives(primitives.assistantMessage)
    );
  }

  toPrimitives(): CVChatMessagePairPrimitives {
    return {
      userMessage: this.userMsg.toPrimitives(),
      assistantMessage: this.assistantMsg.toPrimitives(),
    };
  }

  get userMessage(): ChatMessage {
    return this.userMsg;
  }

  get assistantMessage(): ChatMessage {
    return this.assistantMsg;
  }
}
