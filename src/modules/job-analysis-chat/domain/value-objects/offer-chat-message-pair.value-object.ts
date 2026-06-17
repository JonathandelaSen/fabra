import { ValueObject } from "@/modules/shared";
import { ChatMessage, type ChatMessagePrimitives } from "../entities/chat-message.entity";

export interface OfferChatMessagePairPrimitives {
  userMessage: ChatMessagePrimitives;
  assistantMessage: ChatMessagePrimitives;
}

export class OfferChatMessagePair extends ValueObject<OfferChatMessagePairPrimitives> {
  private constructor(
    private readonly userMsg: ChatMessage,
    private readonly assistantMsg: ChatMessage
  ) {
    super();
  }

  static create(
    userMessage: ChatMessage,
    assistantMessage: ChatMessage
  ): OfferChatMessagePair {
    return new OfferChatMessagePair(userMessage, assistantMessage);
  }

  static fromPrimitives(
    primitives: OfferChatMessagePairPrimitives
  ): OfferChatMessagePair {
    return new OfferChatMessagePair(
      ChatMessage.fromPrimitives(primitives.userMessage),
      ChatMessage.fromPrimitives(primitives.assistantMessage)
    );
  }

  toPrimitives(): OfferChatMessagePairPrimitives {
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
