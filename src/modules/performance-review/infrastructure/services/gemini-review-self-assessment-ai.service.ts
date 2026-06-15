import { GoogleGenAI } from "@google/genai";
import { badRequest } from "@/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type {
  ReviewSelfAssessmentAIInput,
  ReviewSelfAssessmentAIService,
} from "../../domain/repositories/review-self-assessment-ai.service";
import {
  buildSelfAssessmentSystemPrompt,
  buildSelfAssessmentUserPrompt,
} from "./review-self-assessment-prompts";

export class GeminiReviewSelfAssessmentAIService
  implements ReviewSelfAssessmentAIService
{
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async generate(input: ReviewSelfAssessmentAIInput): Promise<string> {
    const googleAI = new GoogleGenAI({ apiKey: this.config.apiKey });
    const response = await googleAI.models.generateContent({
      model: this.config.model,
      contents: [
        {
          role: "user",
          parts: [{ text: buildSelfAssessmentUserPrompt(input) }],
        },
      ],
      config: {
        systemInstruction: buildSelfAssessmentSystemPrompt(),
      },
    });

    const content = (response.text || "").trim();
    if (!content) {
      throw new Error("The AI could not generate the self-assessment.");
    }
    return content;
  }
}

export class GeminiReviewSelfAssessmentAIServiceFactory {
  create(config: {
    apiKey?: string;
    model: string;
  }): ReviewSelfAssessmentAIService {
    if (!config.apiKey) throw badRequest("API key is required for Gemini.", ErrorCode.AI_API_KEY_REQUIRED);
    return new GeminiReviewSelfAssessmentAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
