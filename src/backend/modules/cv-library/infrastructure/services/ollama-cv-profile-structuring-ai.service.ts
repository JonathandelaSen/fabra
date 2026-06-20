import { Ollama } from "ollama";
import {
  CV_PROFILE_SCHEMA_VERSION,
  normalizeStandardCVProfile,
} from "../../domain/cv-profile";
import type { CVProfileStructuringAIService } from "../../domain/repositories/cv-profile-ai.service";
import { StructuredCVProfileData } from "../../domain/value-objects/structured-cv-profile-data.value-object";
import { CVProfileStructuringPromptService } from "../../domain/services/cv-profile-structuring-prompt.service";

const promptService = new CVProfileStructuringPromptService();

class OllamaCVProfileStructuringAIService
  implements CVProfileStructuringAIService
{
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async structure(input: { text: string }): Promise<StructuredCVProfileData> {
    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    
    const response = await ollama.generate({
      model: this.config.model,
      prompt: input.text,
      system: promptService.build(),
      format: "json",
      stream: false,
    });

    const rawText = response.response || "{}";
    const parsed = JSON.parse(rawText) as unknown;

    return StructuredCVProfileData.fromPrimitives({
      schemaVersion: CV_PROFILE_SCHEMA_VERSION,
      profile: normalizeStandardCVProfile(parsed),
    });
  }
}

export class OllamaCVProfileStructuringAIServiceFactory {
  create(
    config: { baseUrl?: string; model: string },
  ): CVProfileStructuringAIService {
    return new OllamaCVProfileStructuringAIService({
      baseUrl: config.baseUrl,
      model: config.model,
    });
  }
}