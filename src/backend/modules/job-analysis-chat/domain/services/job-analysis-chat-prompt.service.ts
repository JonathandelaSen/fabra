import {
  JobAnalysisChatPrompt,
  type OfferChatCopyPastePromptInput,
  type OfferChatHistoryMessage,
  type OfferChatPromptInput,
} from "./job-analysis-chat.prompt";

export type {
  OfferChatCopyPastePromptInput,
  OfferChatHistoryMessage,
  OfferChatPromptInput,
};

export class JobAnalysisChatPromptService {
  private readonly prompt = new JobAnalysisChatPrompt();

  systemInstruction(): string {
    return this.prompt.systemInstruction();
  }

  build(input: OfferChatPromptInput): string {
    return this.prompt.build(input);
  }

  buildForClipboard(input: OfferChatCopyPastePromptInput): string {
    return this.prompt.buildForClipboard(input);
  }
}
