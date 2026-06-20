import { GoogleGenAI } from "@google/genai";
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

export class GeminiFeedbackAIService implements FeedbackAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async generateFinalFeedback(
    input: GenerateFinalFeedbackInput
  ): Promise<FinalFeedbackText> {
    const googleAI = new GoogleGenAI({ apiKey: this.config.apiKey });
    const response = await googleAI.models.generateContent({
      model: this.config.model,
      contents: [
        {
          role: "user",
          parts: [{ text: promptService.build(input) }],
        },
      ],
      config: {
        systemInstruction: promptService.systemInstruction(),
        responseMimeType: "application/json",
      },
    });

    return FinalFeedbackText.fromPrimitives(parseFinalFeedbackAIResponse(response.text || "{}"));
  }
}

export class GeminiFeedbackAIServiceFactory {
  create(config: { apiKey?: string; model: string }): FeedbackAIService {
    if (!config.apiKey) throw badRequest("API key is required for Gemini.", ErrorCode.AI_API_KEY_REQUIRED);
    return new GeminiFeedbackAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
