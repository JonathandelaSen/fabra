import { ValueObject } from "@/modules/shared";
import { ChatMessage, type ChatMessagePrimitives } from "../entities/chat-message.entity";

export interface JobAnalysisChatExchangePrimitives {
  userMessage: ChatMessagePrimitives;
  assistantMessage: ChatMessagePrimitives;
}

export class JobAnalysisChatExchange extends ValueObject<JobAnalysisChatExchangePrimitives> {
  private constructor(
    private readonly userMsg: ChatMessage,
    private readonly assistantMsg: ChatMessage
  ) {
    super();
  }

  static create(userMsg: ChatMessage, assistantMsg: ChatMessage): JobAnalysisChatExchange {
    return new JobAnalysisChatExchange(userMsg, assistantMsg);
  }

  static fromPrimitives(primitives: JobAnalysisChatExchangePrimitives): JobAnalysisChatExchange {
    return new JobAnalysisChatExchange(
      ChatMessage.fromPrimitives(primitives.userMessage),
      ChatMessage.fromPrimitives(primitives.assistantMessage)
    );
  }

  get userMessage(): ChatMessage {
    return this.userMsg;
  }

  get assistantMessage(): ChatMessage {
    return this.assistantMsg;
  }

  toPrimitives(): JobAnalysisChatExchangePrimitives {
    return {
      userMessage: this.userMsg.toPrimitives(),
      assistantMessage: this.assistantMsg.toPrimitives(),
    };
  }
}
