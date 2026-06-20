import { GoogleGenAI } from "@google/genai";
import type { CVRecord } from "@/lib/analysis-types";
import { ErrorCode } from "@/shared/error-codes";
import { badRequest } from "@/backend/modules/shared";
import { CVChatPromptService, type CVChatHistoryMessage } from "../../domain/services/cv-chat-prompt.service";

const promptService = new CVChatPromptService();
import type {
  CVChatAIInput,
  CVChatAIService,
} from "../../domain/repositories/cv-chat-ai-service.repository";
import { CVChatContent } from "../../domain/value-objects/cv-chat-content.value-object";

export class GeminiCVChatAIService implements CVChatAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async generateAnswer(input: CVChatAIInput): Promise<CVChatContent> {
    const promptInput = {
      message: input.message,
      cv: input.context.cv as CVRecord | null,
      cvText: input.context.cvText,
      history: input.history.map((message) => ({
        role: message.role,
        content: message.content,
      })) satisfies CVChatHistoryMessage[],
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

  private parseResponse(rawText: string): CVChatContent {
    const parsed = JSON.parse(rawText || "{}") as Record<string, unknown>;
    const answer =
      typeof parsed.answer === "string" ? parsed.answer.trim() : "";

    if (!answer) {
      throw new Error("The AI could not generate an answer with this context.");
    }

    return CVChatContent.fromPrimitives(answer);
  }
}

export class GeminiCVChatAIServiceFactory {
  create(config: { apiKey?: string; model: string }): CVChatAIService {
    if (!config.apiKey) throw badRequest("API key is required for Gemini.", ErrorCode.AI_API_KEY_REQUIRED);
    return new GeminiCVChatAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
