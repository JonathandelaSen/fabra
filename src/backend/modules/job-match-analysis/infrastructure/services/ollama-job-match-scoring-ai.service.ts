import { Ollama } from "ollama";
import type {
  JobMatchScoringAIInput,
  JobMatchScoringAIResult,
  JobMatchScoringAIService,
} from "../../domain/repositories/job-match-scoring-ai.service";
import { buildJobMatchScoringPrompt } from "../../domain/services/job-match-scoring-prompts";

function cleanArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function cleanJobKeyData(value: unknown): unknown | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  return {
    title: typeof raw.title === "string" ? raw.title : null,
    company: typeof raw.company === "string" ? raw.company : null,
    location: typeof raw.location === "string" ? raw.location : null,
    remote: typeof raw.remote === "string" ? raw.remote : null,
    salary: typeof raw.salary === "string" ? raw.salary : null,
    seniority: typeof raw.seniority === "string" ? raw.seniority : null,
    contractType:
      typeof raw.contractType === "string" ? raw.contractType : null,
    benefits: cleanArray(raw.benefits),
    requirements: cleanArray(raw.requirements),
    responsibilities: cleanArray(raw.responsibilities),
    notablePoints: cleanArray(raw.notablePoints),
  };
}

function parseResult(rawText: string): JobMatchScoringAIResult {
  const parsed = JSON.parse(rawText || "{}") as Record<string, unknown>;
  const keywordsFound = cleanArray(parsed.keywordsFound);
  const cvKeywords = cleanArray(parsed.cvKeywords);

  return {
    score: typeof parsed.score === "number" ? parsed.score : 0,
    feedback:
      typeof parsed.feedback === "string"
        ? parsed.feedback
        : "Feedback could not be generated.",
    aiKeywords: keywordsFound,
    improvements: cleanArray(parsed.improvements),
    jobKeyData: cleanJobKeyData(parsed.jobKeyData),
    jobKeywords: cleanArray(parsed.jobKeywords),
    cvKeywords: cvKeywords.length > 0 ? cvKeywords : keywordsFound,
    matchingKeywords: cleanArray(parsed.matchingKeywords),
    missingKeywords: cleanArray(parsed.missingKeywords),
  };
}

class OllamaJobMatchScoringAIService implements JobMatchScoringAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async score(input: JobMatchScoringAIInput): Promise<JobMatchScoringAIResult> {
    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    const response = await ollama.generate({
      model: this.config.model,
      prompt: input.text,
      system: buildJobMatchScoringPrompt(
        input.jobDescription,
        input.jobUrl,
        input.language,
      ),
      format: "json",
      stream: false,
    });

    return parseResult(response.response || "{}");
  }
}

export class OllamaJobMatchScoringAIServiceFactory {
  create(config: {
    baseUrl?: string;
    model: string;
  }): JobMatchScoringAIService {
    return new OllamaJobMatchScoringAIService({
      baseUrl: config.baseUrl,
      model: config.model,
    });
  }
}