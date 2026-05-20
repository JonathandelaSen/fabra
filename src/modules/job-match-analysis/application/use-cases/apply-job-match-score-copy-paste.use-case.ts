import { createRequestId } from "@/lib/observability";
import { ASSISTANCE_MODE } from "@/modules/shared/application/assisted-workflows/copy-paste-workflow.types";
import { UserId, type EventTracker } from "@/modules/shared";
import { JobMatchAnalysis } from "../../domain/entities/job-match-analysis.entity";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";
import type { JobMatchScoringAIResult } from "../../domain/repositories/job-match-scoring-ai.service";
import { JobMatchAnalysisId } from "../../domain/value-objects/job-match-analysis-id.value-object";
import {
  JOB_MATCH_SCORE_COPY_PASTE_MODEL,
  JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
  JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
  validateJobMatchScoreCopyPasteResult,
} from "../services/job-match-score-copy-paste-result.validator";

export interface ApplyJobMatchScoreCopyPasteInput {
  id: string;
  userId: string;
  parsedResult: JobMatchScoringAIResult;
  jobDescription: string;
  jobUrl: string | null;
}

export class ApplyJobMatchScoreCopyPasteUseCase {
  constructor(
    private readonly deps: {
      repo: JobMatchAnalysisRepository;
      tracker: EventTracker;
    },
  ) {}

  async execute(
    input: ApplyJobMatchScoreCopyPasteInput,
  ): Promise<JobMatchAnalysis | null> {
    const id = JobMatchAnalysisId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const current = await this.deps.repo.findById(id, userId);
    if (!current) return null;

    const result = validateJobMatchScoreCopyPasteResult(input.parsedResult);
    const now = new Date().toISOString();
    const primitives = current.toPrimitives();
    const updated = await this.deps.repo.save(
      JobMatchAnalysis.fromPrimitives({
        ...primitives,
        aiModel: JOB_MATCH_SCORE_COPY_PASTE_MODEL,
        score: result.score,
        feedback: result.feedback,
        aiKeywords: result.aiKeywords,
        improvements: result.improvements,
        jobSnapshot: {
          description: input.jobDescription,
          url: input.jobUrl,
          keyData: result.jobKeyData,
        },
        jobKeywords: result.jobKeywords,
        cvKeywords: result.cvKeywords,
        matchingKeywords: result.matchingKeywords,
        missingKeywords: result.missingKeywords,
        analyzedAt: now,
        updatedAt: now,
      }),
    );

    await this.deps.tracker.record({
      userId: input.userId,
      analysisId: input.id,
      requestId: createRequestId("job_match_copy_paste_apply"),
      stage: "job_match_copy_paste_result_applied",
      status: "success",
      source: "job_match_analysis",
      metadata: {
        assistanceMode: ASSISTANCE_MODE.copyPaste,
        workflowId: JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
        schemaVersion: JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
        model: JOB_MATCH_SCORE_COPY_PASTE_MODEL,
      },
    });

    return updated;
  }
}
