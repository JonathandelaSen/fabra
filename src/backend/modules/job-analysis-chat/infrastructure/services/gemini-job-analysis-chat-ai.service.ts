import { GoogleGenAI } from "@google/genai";
import type { Analysis, CVRecord } from "@/lib/analysis-types";
import { ErrorCode } from "@/shared/error-codes";
import { badRequest } from "@/backend/modules/shared";
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

export class GeminiJobAnalysisChatAIService implements JobAnalysisChatAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

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

    const googleAI = new GoogleGenAI({ apiKey: this.config.apiKey });
    const response = await googleAI.models.generateContent({
      model: this.config.model,
      contents: [
        {
          role: "user",
          parts: [{ text: promptService.build(promptInput) }],
        },
      ],
      config: {
        systemInstruction: promptService.systemInstruction(),
        responseMimeType: "application/json",
      },
    });

    return this.parseResponse(response.text || "{}");
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

export class GeminiJobAnalysisChatAIServiceFactory {
  create(config: { apiKey?: string; model: string }): JobAnalysisChatAIService {
    if (!config.apiKey) throw badRequest("API key is required for Gemini.", ErrorCode.AI_API_KEY_REQUIRED);
    return new GeminiJobAnalysisChatAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
