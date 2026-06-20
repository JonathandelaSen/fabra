import OpenAI from "openai";
import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type {
  FeedbackAIService,
  GenerateFinalFeedbackInput,
} from "../../domain/repositories/feedback-ai-service.repository";
import { FinalFeedbackText } from "../../domain/value-objects/final-feedback-text.value-object";
import { FeedbackNotesFinalPromptService } from "../../domain/services/feedback-notes-final-prompt.service";

const promptService = new FeedbackNotesFinalPromptService();
import { parseFinalFeedbackAIResponse } from "../../domain/services/feedback-ai-response-parser";

export class OpenAIFeedbackAIService implements FeedbackAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async generateFinalFeedback(
    input: GenerateFinalFeedbackInput
  ): Promise<FinalFeedbackText> {
    const openai = new OpenAI({ apiKey: this.config.apiKey });
    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: promptService.systemInstruction() },
        { role: "user", content: promptService.build(input) },
      ],
      response_format: { type: "json_object" },
    });

    return FinalFeedbackText.fromPrimitives(parseFinalFeedbackAIResponse(response.choices[0]?.message.content || "{}"));
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
