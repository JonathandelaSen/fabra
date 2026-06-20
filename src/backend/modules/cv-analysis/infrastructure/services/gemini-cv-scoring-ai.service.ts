import { GoogleGenAI } from "@google/genai";
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

class GeminiCVScoringAIService implements CVScoringAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async score(input: CVScoringAIInput): Promise<CVScoringAIResult> {
    const googleAI = new GoogleGenAI({ apiKey: this.config.apiKey });
    const response = await googleAI.models.generateContent({
      model: this.config.model,
      contents: [{ role: "user", parts: [{ text: input.text }] }],
      config: {
        systemInstruction: promptService.build({
          additionalContext: input.additionalContext,
          language: input.language,
        }),
        responseMimeType: "application/json",
      },
    });

    return CVScoringAIResult.fromPrimitives(parseResult(response.text || "{}"));
  }
}

export class GeminiCVScoringAIServiceFactory
{
  create(config: { apiKey?: string; model: string }): CVScoringAIService {
    if (!config.apiKey) throw badRequest("API key is required for Gemini.", ErrorCode.AI_API_KEY_REQUIRED);
    return new GeminiCVScoringAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
