import OpenAI from "openai";
import type { Analysis, CVRecord } from "@/lib/analysis-types";
import { ErrorCode } from "@/shared/error-codes";
import { badRequest } from "@/backend/modules/shared";
import {
  OFFER_CHAT_SYSTEM_PROMPT,
  buildOfferChatPrompt,
  type OfferChatHistoryMessage,
} from "../../domain/services/job-analysis-chat-prompts";
import type {
  JobAnalysisChatAIInput,
  JobAnalysisChatAIService,
} from "../../domain/repositories/job-analysis-chat-ai-service.repository";

export class OpenAIJobAnalysisChatAIService implements JobAnalysisChatAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

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

    const openai = new OpenAI({ apiKey: this.config.apiKey });
    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: OFFER_CHAT_SYSTEM_PROMPT },
        { role: "user", content: buildOfferChatPrompt(promptInput) },
      ],
      response_format: { type: "json_object" },
    });

    return this.parseResponse(response.choices[0]?.message.content || "{}");
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

export class OpenAIJobAnalysisChatAIServiceFactory {
  create(config: { apiKey?: string; model: string }): JobAnalysisChatAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.", ErrorCode.AI_API_KEY_REQUIRED);
    return new OpenAIJobAnalysisChatAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
