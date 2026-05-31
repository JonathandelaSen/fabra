import { Ollama } from "ollama";
import {
  normalizeStandardCVProfile,
  type StandardCVProfile,
} from "../../domain/cv-profile";
import type { CVTemplateId, CVTemplateLocale } from "../../domain/cv-templates";
import type {
  CVProfileEditingAIService,
} from "../../domain/repositories/cv-profile-ai.service";
import { SYSTEM_PROMPT } from "./cv-profile-editing-prompts";

export interface AICVEditInput {
  baseUrl?: string;
  model: string;
  profile: StandardCVProfile;
  instruction: string;
  templateId?: CVTemplateId;
  locale?: CVTemplateLocale;
  recommendations?: string[];
}

export function parseEditedCVProfile(rawText: string): StandardCVProfile {
  const parsed = JSON.parse(rawText || "{}") as unknown;
  const normalized = normalizeStandardCVProfile(parsed);
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

class OllamaCVProfileEditingAIService implements CVProfileEditingAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async edit(
    input: Omit<AICVEditInput, "baseUrl" | "model">,
  ): Promise<StandardCVProfile> {
    const recommendations = input.recommendations?.length
      ? `\nRelevant recommendations from previous analysis:\n${input.recommendations
          .map((item) => `- ${item}`)
          .join("\n")}`
      : "";

    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: `Instruction:\n${input.instruction}\n\nTemplate context:\n${input.templateId ?? "unknown"} / ${input.locale ?? "es"}${recommendations}\n\nStructured CV profile JSON:\n${JSON.stringify(input.profile)}`,
      system: SYSTEM_PROMPT,
      format: "json",
    });

    return {
      ...parseEditedCVProfile(response.response || "{}"),
      presentation: input.profile.presentation,
    };
  }
}

export class OllamaCVProfileEditingAIServiceFactory {
  create(config: { baseUrl?: string; model: string }): CVProfileEditingAIService {
    return new OllamaCVProfileEditingAIService(config);
  }
}
