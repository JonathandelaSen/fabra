import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class OllamaJobMatchScoringParseError extends DomainError {
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      ErrorCode.OLLAMA_JOB_MATCH_SCORING_PARSE_FAILED,
      `Failed to parse Ollama job match scoring AI response: ${reason}`,
      data,
    );
    this.name = "OllamaJobMatchScoringParseError";
  }
}
