import OpenAI from "openai";
import type { Analysis, CVRecord } from "@/lib/analysis-types";
import { badRequest } from "@/modules/shared";
import {
  OFFER_CHAT_SYSTEM_PROMPT,
  buildOfferChatPrompt,
  type OfferChatHistoryMessage,
} from "./analysis-chat-prompts";
import type {
  AnalysisChatAIInput,
  AnalysisChatAIService,
} from "../../domain/repositories/analysis-chat-ai-service.repository";

export class OpenAIAnalysisChatAIService implements AnalysisChatAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async generateAnswer(input: AnalysisChatAIInput): Promise<string> {
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

export class OpenAIAnalysisChatAIServiceFactory {
  create(config: { apiKey?: string; model: string }): AnalysisChatAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.");
    return new OpenAIAnalysisChatAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
