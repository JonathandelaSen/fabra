import type { CVProfilePrimitives } from "../../domain/value-objects/cv-profile.value-object";
import { GoogleGenAI } from "@google/genai";
import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import { CV_PROFILE_SCHEMA_VERSION } from "../../domain/cv-profile";
import type { CVProfileStructuringAIService } from "../../domain/repositories/cv-profile-ai.service";
import { StructuredCVProfileData } from "../../domain/value-objects/structured-cv-profile-data.value-object";
import { CVProfileStructuringPromptService } from "../../domain/services/cv-profile-structuring-prompt.service";

const promptService = new CVProfileStructuringPromptService();

class GeminiCVProfileStructuringAIService implements CVProfileStructuringAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async structure(input: { text: string }): Promise<StructuredCVProfileData> {
    const googleAI = new GoogleGenAI({ apiKey: this.config.apiKey });
    const response = await googleAI.models.generateContent({
      model: this.config.model,
      contents: [{ role: "user", parts: [{ text: input.text }] }],
      config: {
        systemInstruction: promptService.build(),
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "{}";
    const parsed = JSON.parse(rawText) as unknown;

    return StructuredCVProfileData.fromPrimitives({
      schemaVersion: CV_PROFILE_SCHEMA_VERSION,
      profile: mapAIProfileResponseToPrimitives(parsed),
    });
  }
}

function mapAIProfileResponseToPrimitives(
  response: unknown,
): CVProfilePrimitives {
  return response as CVProfilePrimitives;
}

export class GeminiCVProfileStructuringAIServiceFactory {
  create(config: {
    apiKey?: string;
    model: string;
  }): CVProfileStructuringAIService {
    if (!config.apiKey)
      throw badRequest(
        "API key is required for Gemini.",
        ErrorCode.AI_API_KEY_REQUIRED,
      );
    return new GeminiCVProfileStructuringAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
