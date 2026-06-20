import OpenAI from "openai";
import { badRequest, AI_PROVIDER } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import {
  CV_PROFILE_SCHEMA_VERSION,
  normalizeStandardCVProfile,
} from "../../domain/cv-profile";
import type { CVProfileStructuringAIService } from "../../domain/repositories/cv-profile-ai.service";
import { StructuredCVProfileData } from "../../domain/value-objects/structured-cv-profile-data.value-object";
import { CVProfileStructuringPromptService } from "../../domain/services/cv-profile-structuring-prompt.service";

const promptService = new CVProfileStructuringPromptService();

class OpenAICVProfileStructuringAIService
  implements CVProfileStructuringAIService
{
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async structure(input: { text: string }): Promise<StructuredCVProfileData> {
    const openai = new OpenAI({ apiKey: this.config.apiKey });
    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: promptService.build() },
        { role: "user", content: input.text },
      ],
      response_format: { type: "json_object" },
    });

    const rawText = response.choices[0]?.message.content || "{}";
    const parsed = JSON.parse(rawText) as unknown;

    return StructuredCVProfileData.fromPrimitives({
      schemaVersion: CV_PROFILE_SCHEMA_VERSION,
      profile: normalizeStandardCVProfile(parsed),
    });
  }
}

export class OpenAICVProfileStructuringAIServiceFactory {
  create(
    config: { apiKey?: string; model: string },
  ): CVProfileStructuringAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.", ErrorCode.AI_API_KEY_REQUIRED);
    return new OpenAICVProfileStructuringAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
