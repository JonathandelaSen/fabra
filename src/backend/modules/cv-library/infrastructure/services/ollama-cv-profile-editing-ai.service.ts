import { Ollama } from "ollama";
import {
  CVProfile,
  type CVProfilePrimitives,
} from "../../domain/value-objects/cv-profile.value-object";
import type { CVTemplateId, CVTemplateLocale } from "../../domain/cv-templates";
import type { CVProfileEditingAIService } from "../../domain/repositories/cv-profile-ai.service";
import { CVProfileEditingPromptService } from "../../domain/services/cv-profile-editing-prompt.service";

const promptService = new CVProfileEditingPromptService();

export interface AICVEditInput {
  baseUrl?: string;
  model: string;
  profile: CVProfilePrimitives;
  instruction: string;
  templateId?: CVTemplateId;
  locale?: CVTemplateLocale;
  recommendations?: string[];
}

export function parseEditedCVProfile(rawText: string): CVProfilePrimitives {
  const parsed = JSON.parse(rawText || "{}") as unknown;
  const normalized = mapAIProfileResponseToPrimitives(parsed);
  const hasContent =
    Boolean(normalized.summary) ||
    Object.keys(normalized.basics ?? {}).length > 0 ||
    Boolean(normalized.experience?.length) ||
    Boolean(normalized.education?.length) ||
    Boolean(normalized.skills?.length) ||
    Boolean(normalized.technicalSkills?.length);

  if (!hasContent) {
    throw new Error("AI response did not contain a usable CV profile.");
  }

  return normalized;
}

function mapAIProfileResponseToPrimitives(
  response: unknown,
): CVProfilePrimitives {
  return response as CVProfilePrimitives;
}

class OllamaCVProfileEditingAIService implements CVProfileEditingAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async edit(
    input: Omit<AICVEditInput, "baseUrl" | "model">,
  ): Promise<CVProfile> {
    const recommendations = input.recommendations?.length
      ? `\nRelevant recommendations from previous analysis:\n${input.recommendations
          .map((item) => `- ${item}`)
          .join("\n")}`
      : "";

    const ollama = new Ollama({
      host: this.config.baseUrl || "http://localhost:11434",
    });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: `Instruction:\n${input.instruction}\n\nTemplate context:\n${input.templateId ?? "unknown"} / ${input.locale ?? "es"}${recommendations}\n\nStructured CV profile JSON:\n${JSON.stringify(input.profile)}`,
      system: promptService.build(),
      format: "json",
    });

    return CVProfile.fromPrimitives({
      ...parseEditedCVProfile(response.response || "{}"),
      presentation: input.profile.presentation,
    });
  }
}

export class OllamaCVProfileEditingAIServiceFactory {
  create(config: {
    baseUrl?: string;
    model: string;
  }): CVProfileEditingAIService {
    return new OllamaCVProfileEditingAIService(config);
  }
}
