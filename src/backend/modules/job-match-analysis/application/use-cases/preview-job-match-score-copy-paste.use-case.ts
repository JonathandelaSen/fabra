import { UserId } from "@/backend/modules/shared";
import { extractCopyPasteJson } from "@/backend/modules/shared/application/assisted-workflows/copy-paste-json-parser";
import { validateCopyPasteEnvelope } from "@/backend/modules/shared/application/assisted-workflows/copy-paste-json-envelope";
import type { JobMatchScoringAIResult } from "../../domain/repositories/job-match-scoring-ai.service";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";
import { JobMatchAnalysisId } from "../../domain/value-objects/job-match-analysis-id.value-object";
import {
  JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
  JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
  validateJobMatchScoreCopyPasteResult,
} from "../services/job-match-score-copy-paste-result.validator";
import { JobMatchScorePreview } from "../../domain/value-objects/job-match-score-preview.value-object";

export interface PreviewJobMatchScoreCopyPasteInput {
  id: string;
  userId: string;
  rawResponse: string;
}

export class PreviewJobMatchScoreCopyPasteUseCase {
  constructor(
    private readonly deps: {
      repo: JobMatchAnalysisRepository;
    },
  ) {}

  async execute(
    input: PreviewJobMatchScoreCopyPasteInput,
  ): Promise<JobMatchScorePreview | null> {
    const id = JobMatchAnalysisId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const analysis = await this.deps.repo.findById(id, userId);
    if (!analysis) return null;

    const envelope = extractCopyPasteJson(input.rawResponse);
    const result = validateCopyPasteEnvelope(envelope, {
      workflowId: JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
    });
    const parsedResult = validateJobMatchScoreCopyPasteResult(result);
    const primitives = analysis.toPrimitives();
    const willReplaceExistingResult = primitives.score !== null;

    return JobMatchScorePreview.fromPrimitives({
      parsedResult,
      preview: {
        score: parsedResult.score,
        summary: parsedResult.feedback.slice(0, 280),
        matchingKeywordsCount: parsedResult.matchingKeywords.length,
        missingKeywordsCount: parsedResult.missingKeywords.length,
        jobKeywordsCount: parsedResult.jobKeywords.length,
        recommendationsCount: parsedResult.improvements.length,
        originLabel: "external_chat",
        willReplaceExistingResult,
      },
      warnings: willReplaceExistingResult
        ? ["This will replace the current analysis result."]
        : [],
    });
  }
}
