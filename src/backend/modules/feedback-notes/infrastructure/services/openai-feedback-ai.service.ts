import OpenAI from "openai";
import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type {
  FeedbackAIService,
  GenerateFinalFeedbackInput,
} from "../../domain/repositories/feedback-ai-service.repository";
import {
  buildFeedbackNotesFinalPrompt,
  FEEDBACK_NOTES_FINAL_SYSTEM_PROMPT,
} from "../../domain/services/feedback-notes-prompts";
import { parseFinalFeedbackAIResponse } from "./feedback-ai-response-parser";

export class OpenAIFeedbackAIService implements FeedbackAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async generateFinalFeedback(
    input: GenerateFinalFeedbackInput
  ): Promise<string> {
    const openai = new OpenAI({ apiKey: this.config.apiKey });
    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: FEEDBACK_NOTES_FINAL_SYSTEM_PROMPT },
        { role: "user", content: buildFeedbackNotesFinalPrompt(input) },
      ],
      response_format: { type: "json_object" },
    });

    return parseFinalFeedbackAIResponse(response.choices[0]?.message.content || "{}");
  }
}

export class OpenAIFeedbackAIServiceFactory {
  create(config: { apiKey?: string; model: string }): FeedbackAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.", ErrorCode.AI_API_KEY_REQUIRED);
    return new OpenAIFeedbackAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
