import OpenAI from "openai";
import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type { StandardCVProfile } from "../../domain/cv-profile";
import type { CVProfileEditingAIService } from "../../domain/repositories/cv-profile-ai.service";
import { SYSTEM_PROMPT } from "./cv-profile-editing-prompts";
import { parseEditedCVProfile, type AICVEditInput } from "./gemini-cv-profile-editing-ai.service";

class OpenAICVProfileEditingAIService implements CVProfileEditingAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async edit(
    input: Omit<AICVEditInput, "apiKey" | "model">,
  ): Promise<StandardCVProfile> {
    const openai = new OpenAI({ apiKey: this.config.apiKey });
    const recommendations = input.recommendations?.length
      ? `\nRelevant recommendations from previous analysis:\n${input.recommendations
          .map((item) => `- ${item}`)
          .join("\n")}`
      : "";

    const userText = `Instruction:\n${input.instruction}\n\nTemplate context:\n${input.templateId ?? "unknown"} / ${input.locale ?? "es"}${recommendations}\n\nStructured CV profile JSON:\n${JSON.stringify(input.profile)}`;

    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userText },
      ],
      response_format: { type: "json_object" },
    });

    return {
      ...parseEditedCVProfile(response.choices[0]?.message.content || "{}"),
      presentation: input.profile.presentation,
    };
  }
}

export class OpenAICVProfileEditingAIServiceFactory {
  create(config: { apiKey?: string; model: string }): CVProfileEditingAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.", ErrorCode.AI_API_KEY_REQUIRED);
    return new OpenAICVProfileEditingAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
