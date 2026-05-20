import { createRequestId } from "@/lib/observability";
import { ASSISTANCE_MODE } from "@/modules/shared/application/assisted-workflows/copy-paste-workflow.types";
import { extractCopyPasteJson } from "@/modules/shared/application/assisted-workflows/copy-paste-json-parser";
import { validateCopyPasteEnvelope } from "@/modules/shared/application/assisted-workflows/copy-paste-json-envelope";
import { UserId, type EventTracker } from "@/modules/shared";
import type { JobMatchScoringAIResult } from "../../domain/repositories/job-match-scoring-ai.service";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";
import { JobMatchAnalysisId } from "../../domain/value-objects/job-match-analysis-id.value-object";
import {
  JOB_MATCH_SCORE_COPY_PASTE_MODEL,
  JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
  JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
  validateJobMatchScoreCopyPasteResult,
} from "../services/job-match-score-copy-paste-result.validator";

export interface PreviewJobMatchScoreCopyPasteInput {
  id: string;
  userId: string;
  rawResponse: string;
}

export interface PreviewJobMatchScoreCopyPasteResult {
  parsedResult: JobMatchScoringAIResult;
  preview: {
    score: number;
    summary: string;
    matchingKeywordsCount: number;
    missingKeywordsCount: number;
    jobKeywordsCount: number;
    recommendationsCount: number;
    originLabel: "external_chat";
    willReplaceExistingResult: boolean;
  };
  warnings: string[];
}

export class PreviewJobMatchScoreCopyPasteUseCase {
  constructor(
    private readonly deps: {
      repo: JobMatchAnalysisRepository;
      tracker: EventTracker;
    },
  ) {}

  async execute(
    input: PreviewJobMatchScoreCopyPasteInput,
  ): Promise<PreviewJobMatchScoreCopyPasteResult | null> {
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

    await this.deps.tracker.record({
      userId: input.userId,
      analysisId: input.id,
      requestId: createRequestId("job_match_copy_paste_preview"),
      stage: "job_match_copy_paste_response_previewed",
      status: "success",
      source: "job_match_analysis",
      metadata: {
        assistanceMode: ASSISTANCE_MODE.copyPaste,
        workflowId: JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
        schemaVersion: JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
        model: JOB_MATCH_SCORE_COPY_PASTE_MODEL,
      },
    });

    return {
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
    };
  }
}
