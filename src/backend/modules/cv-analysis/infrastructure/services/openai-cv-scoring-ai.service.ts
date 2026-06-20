import OpenAI from "openai";
import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type {
  CVScoringAIInput,
  CVScoringAIResultPrimitives,
  CVScoringAIService,
} from "../../domain/repositories/cv-scoring-ai.service";
import { CVScoringAIResult } from "../../domain/value-objects/cv-scoring-ai-result.value-object";
import { CVScoringPromptService } from "../../domain/services/cv-scoring-prompt.service";

const promptService = new CVScoringPromptService();

function cleanArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseResult(rawText: string): CVScoringAIResultPrimitives {
  const parsed = JSON.parse(rawText || "{}") as Record<string, unknown>;
  const keywordsFound = cleanArray(parsed.keywordsFound);
  const cvKeywords = cleanArray(parsed.cvKeywords);

  return {
    score: typeof parsed.score === "number" ? parsed.score : 0,
    feedback:
      typeof parsed.feedback === "string"
        ? parsed.feedback
        : "Feedback could not be generated.",
    keywords: cvKeywords.length > 0 ? cvKeywords : keywordsFound,
    improvements: cleanArray(parsed.improvements),
  };
}

class OpenAICVScoringAIService implements CVScoringAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async score(input: CVScoringAIInput): Promise<CVScoringAIResult> {
    const openai = new OpenAI({ apiKey: this.config.apiKey });
    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: "system",
          content: promptService.build({
          additionalContext: input.additionalContext,
          language: input.language,
        }),
        },
        { role: "user", content: input.text },
      ],
      response_format: { type: "json_object" },
    });

    return CVScoringAIResult.fromPrimitives(parseResult(response.choices[0]?.message.content || "{}"));
  }
}

export class OpenAICVScoringAIServiceFactory {
  create(config: { apiKey?: string; model: string }): CVScoringAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.", ErrorCode.AI_API_KEY_REQUIRED);
    return new OpenAICVScoringAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
