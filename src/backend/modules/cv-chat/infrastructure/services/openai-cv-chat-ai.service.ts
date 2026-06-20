import OpenAI from "openai";
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

export class OpenAICVChatAIService implements CVChatAIService {
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

    const openai = new OpenAI({ apiKey: this.config.apiKey });
    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: promptService.systemInstruction() },
        { role: "user", content: promptService.build(promptInput) },
      ],
      response_format: { type: "json_object" },
    });

    return this.parseResponse(response.choices[0]?.message.content || "{}");
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

export class OpenAICVChatAIServiceFactory {
  create(config: { apiKey?: string; model: string }): CVChatAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.", ErrorCode.AI_API_KEY_REQUIRED);
    return new OpenAICVChatAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
