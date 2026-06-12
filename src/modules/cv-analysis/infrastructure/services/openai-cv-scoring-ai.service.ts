import OpenAI from "openai";
import { badRequest } from "@/modules/shared";
import type {
  CVScoringAIInput,
  CVScoringAIResult,
  CVScoringAIService,
} from "../../domain/repositories/cv-scoring-ai.service";
import { buildGeneralScoringPrompt } from "./cv-scoring-prompts";

function cleanArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseResult(rawText: string): CVScoringAIResult {
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
          content: buildGeneralScoringPrompt(
            input.additionalContext,
            input.language,
          ),
        },
        { role: "user", content: input.text },
      ],
      response_format: { type: "json_object" },
    });

    return parseResult(response.choices[0]?.message.content || "{}");
  }
}

export class OpenAICVScoringAIServiceFactory {
  create(config: { apiKey?: string; model: string }): CVScoringAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.");
    return new OpenAICVScoringAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
