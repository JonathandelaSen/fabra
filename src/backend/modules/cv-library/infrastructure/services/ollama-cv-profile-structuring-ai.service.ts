import { Ollama } from "ollama";
import {
  CV_PROFILE_SCHEMA_VERSION,
  normalizeStandardCVProfile,
} from "../../domain/cv-profile";
import type {
  CVProfileStructuringAIService,
  StructuredCVProfileResult,
} from "../../domain/repositories/cv-profile-ai.service";
import { SYSTEM_PROMPT } from "../../domain/services/cv-profile-structuring-prompts";

class OllamaCVProfileStructuringAIService
  implements CVProfileStructuringAIService
{
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async structure(input: { text: string }): Promise<StructuredCVProfileResult> {
    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    
    const response = await ollama.generate({
      model: this.config.model,
      prompt: input.text,
      system: SYSTEM_PROMPT,
      format: "json",
      stream: false,
    });

    const rawText = response.response || "{}";
    const parsed = JSON.parse(rawText) as unknown;

    return {
      schemaVersion: CV_PROFILE_SCHEMA_VERSION,
      profile: normalizeStandardCVProfile(parsed),
    };
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