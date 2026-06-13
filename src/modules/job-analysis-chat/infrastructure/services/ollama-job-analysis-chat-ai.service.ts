import { Ollama } from "ollama";
import type { Analysis, CVRecord } from "@/lib/analysis-types";
import {
  OFFER_CHAT_SYSTEM_PROMPT,
  buildOfferChatPrompt,
  type OfferChatHistoryMessage,
} from "./job-analysis-chat-prompts";
import type {
  JobAnalysisChatAIInput,
  JobAnalysisChatAIService,
} from "../../domain/repositories/job-analysis-chat-ai-service.repository";

export class OllamaJobAnalysisChatAIService implements JobAnalysisChatAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async generateAnswer(input: JobAnalysisChatAIInput): Promise<string> {
    const promptInput = {
      message: input.message,
      analysis: input.context.analysis as Analysis,
      cv: input.context.cv as CVRecord | null,
      cvText: input.context.cvText,
      history: input.history.map((message) => ({
        role: message.role,
        content: message.content,
      })) satisfies OfferChatHistoryMessage[],
    };

    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: buildOfferChatPrompt(promptInput),
      system: OFFER_CHAT_SYSTEM_PROMPT,
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

export class OllamaJobAnalysisChatAIServiceFactory {
  create(config: { baseUrl?: string; model: string }): JobAnalysisChatAIService {
    return new OllamaJobAnalysisChatAIService(config);
  }
}
