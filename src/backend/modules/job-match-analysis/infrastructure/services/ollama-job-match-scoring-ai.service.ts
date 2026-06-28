import { Ollama } from "ollama";
import type {
  JobMatchScoringAIInput,
  JobMatchScoringAIResult,
  JobMatchScoringAIService,
} from "../../domain/repositories/job-match-scoring-ai.service";
import { JobMatchScoringAIResultVO } from "../../domain/value-objects/job-match-scoring-ai-result.value-object";
import { JobMatchScoringPromptService } from "../../domain/services/job-match-scoring-prompt.service";
import type { Telemetry } from "@/backend/modules/shared";
import { OllamaJobMatchScoringParseError } from "../../domain/errors/ollama-job-match-scoring-parse.error";

const promptService = new JobMatchScoringPromptService();

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

function parseResult(rawText: string, telemetry: Telemetry): JobMatchScoringAIResult {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawText || "{}") as Record<string, unknown>;
  } catch (error) {
    telemetry.log({
      level: "error",
      message: "Failed to parse Ollama job match scoring AI response JSON",
      attributes: { rawText },
    });
    telemetry.captureException(error, {
      attributes: { rawText },
    });
    throw new OllamaJobMatchScoringParseError(
      error instanceof Error ? error.message : String(error),
      { rawJson: rawText },
    );
  }
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
  constructor(
    private readonly config: { baseUrl?: string; model: string },
    private readonly telemetry: Telemetry,
  ) {}

  async score(input: JobMatchScoringAIInput): Promise<JobMatchScoringAIResultVO> {
    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    const response = await ollama.generate({
      model: this.config.model,
      prompt: input.text,
      system: promptService.build({
          jobDescription: input.jobDescription,
          jobUrl: input.jobUrl,
          language: input.language,
        }),
      format: "json",
      stream: false,
    });

    return JobMatchScoringAIResultVO.fromPrimitives(parseResult(response.response || "{}", this.telemetry));
  }
}

export class OllamaJobMatchScoringAIServiceFactory {
  constructor(private readonly telemetry: Telemetry) {}

  create(config: {
    baseUrl?: string;
    model: string;
  }): JobMatchScoringAIService {
    return new OllamaJobMatchScoringAIService(
      {
        baseUrl: config.baseUrl,
        model: config.model,
      },
      this.telemetry,
    );
  }
}