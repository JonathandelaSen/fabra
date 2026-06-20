import { Ollama } from "ollama";
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

class OllamaCVScoringAIService implements CVScoringAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async score(input: CVScoringAIInput): Promise<CVScoringAIResult> {
    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: input.text,
      system: promptService.build({
          additionalContext: input.additionalContext,
          language: input.language,
        }),
      format: "json",
    });

    return CVScoringAIResult.fromPrimitives(parseResult(response.response || "{}"));
  }
}

export class OllamaCVScoringAIServiceFactory {
  create(config: { baseUrl?: string; model: string }): CVScoringAIService {
    return new OllamaCVScoringAIService(config);
  }
}
