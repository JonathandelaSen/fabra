import { Ollama } from "ollama";
import type { CVRecord } from "@/lib/analysis-types";
import { CV_CHAT_SYSTEM_PROMPT, buildCVChatPrompt, type CVChatHistoryMessage } from "./cv-chat-prompts";
import type {
  CVChatAIInput,
  CVChatAIService,
} from "../../domain/repositories/cv-chat-ai-service.repository";

export class OllamaCVChatAIService implements CVChatAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async generateAnswer(input: CVChatAIInput): Promise<string> {
    const promptInput = {
      message: input.message,
      cv: input.context.cv as CVRecord | null,
      cvText: input.context.cvText,
      history: input.history.map((message) => ({
        role: message.role,
        content: message.content,
      })) satisfies CVChatHistoryMessage[],
    };

    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: buildCVChatPrompt(promptInput),
      system: CV_CHAT_SYSTEM_PROMPT,
      format: "json",
    });

    return this.parseResponse(response.response || "{}");
  }

  private parseResponse(rawText: string): string {
    const parsed = JSON.parse(rawText || "{}") as Record<string, unknown>;
    const answer =
      typeof parsed.answer === "string" ? parsed.answer.trim() : "";

    if (!answer) {
      throw new Error("The AI could not generate an answer with this context.");
    }

    return answer;
  }
}

export class OllamaCVChatAIServiceFactory {
  create(config: { baseUrl?: string; model: string }): CVChatAIService {
    return new OllamaCVChatAIService(config);
  }
}
