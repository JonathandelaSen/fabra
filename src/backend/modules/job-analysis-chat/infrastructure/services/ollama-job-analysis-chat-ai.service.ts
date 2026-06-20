import { Ollama } from "ollama";
import type { Analysis, CVRecord } from "@/lib/analysis-types";
import {
  JobAnalysisChatPromptService,
  type OfferChatHistoryMessage,
} from "../../domain/services/job-analysis-chat-prompt.service";

const promptService = new JobAnalysisChatPromptService();
import type {
  JobAnalysisChatAIInput,
  JobAnalysisChatAIService,
} from "../../domain/repositories/job-analysis-chat-ai-service.repository";
import { JobAnalysisChatContent } from "../../domain/value-objects/job-analysis-chat-content.value-object";

export class OllamaJobAnalysisChatAIService implements JobAnalysisChatAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async generateAnswer(input: JobAnalysisChatAIInput): Promise<JobAnalysisChatContent> {
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
      prompt: promptService.build(promptInput),
      system: promptService.systemInstruction(),
      format: "json",
    });

    return this.parseResponse(response.response || "{}");
  }

  private parseResponse(rawText: string): JobAnalysisChatContent {
    const parsed = JSON.parse(rawText || "{}") as Record<string, unknown>;
    const answer =
      typeof parsed.answer === "string" ? parsed.answer.trim() : "";

    if (!answer) {
      throw new Error("The AI could not generate an answer with this context.");
    }

    return JobAnalysisChatContent.fromPrimitives(answer);
  }
}

export class OllamaJobAnalysisChatAIServiceFactory {
  create(config: { baseUrl?: string; model: string }): JobAnalysisChatAIService {
    return new OllamaJobAnalysisChatAIService(config);
  }
}
