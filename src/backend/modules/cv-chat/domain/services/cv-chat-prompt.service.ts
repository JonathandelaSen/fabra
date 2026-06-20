import {
  CVChatPrompt,
  type CVChatHistoryMessage,
  type CVChatPromptInput,
} from "./cv-chat.prompt";

export type { CVChatHistoryMessage, CVChatPromptInput };

export class CVChatPromptService {
  private readonly prompt = new CVChatPrompt();

  systemInstruction(): string {
    return this.prompt.systemInstruction();
  }

  build(input: CVChatPromptInput): string {
    return this.prompt.build(input);
  }
}
