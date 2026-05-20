import { createRequestId } from "@/lib/observability";
import { ASSISTANCE_MODE } from "@/modules/shared/application/assisted-workflows/copy-paste-workflow.types";
import { UserId, type EventTracker } from "@/modules/shared";
import { CVAnalysis } from "../../domain/entities/cv-analysis.entity";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";
import type { CVScoringAIResult } from "../../domain/repositories/cv-scoring-ai.service";
import { CVAnalysisId } from "../../domain/value-objects/cv-analysis-id.value-object";
import {
  CV_SCORE_COPY_PASTE_MODEL,
  CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
  CV_SCORE_COPY_PASTE_WORKFLOW_ID,
  validateCVScoreCopyPasteResult,
} from "../services/cv-score-copy-paste-result.validator";

export interface ApplyCVScoreCopyPasteInput {
  id: string;
  userId: string;
  parsedResult: CVScoringAIResult;
}

export class ApplyCVScoreCopyPasteUseCase {
  constructor(
    private readonly deps: {
      repo: CVAnalysisRepository;
      tracker: EventTracker;
    },
  ) {}

  async execute(input: ApplyCVScoreCopyPasteInput): Promise<CVAnalysis | null> {
    const id = CVAnalysisId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const current = await this.deps.repo.findById(id, userId);
    if (!current) return null;

    const result = validateCVScoreCopyPasteResult(input.parsedResult);
    const now = new Date().toISOString();
    const primitives = current.toPrimitives();
    const updated = await this.deps.repo.save(
      CVAnalysis.fromPrimitives({
        ...primitives,
        aiModel: CV_SCORE_COPY_PASTE_MODEL,
        score: result.score,
        feedback: result.feedback,
        keywords: result.keywords,
        improvements: result.improvements,
        aiContext: {
          ...(typeof primitives.aiContext === "object" &&
          primitives.aiContext !== null &&
          !Array.isArray(primitives.aiContext)
            ? primitives.aiContext
            : {}),
          assistanceMode: ASSISTANCE_MODE.copyPaste,
          workflowId: CV_SCORE_COPY_PASTE_WORKFLOW_ID,
          schemaVersion: CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
        },
        analyzedAt: now,
        updatedAt: now,
      }),
    );

    await this.deps.tracker.record({
      userId: input.userId,
      analysisId: input.id,
      requestId: createRequestId("cv_analysis_copy_paste_apply"),
      stage: "cv_analysis_copy_paste_result_applied",
      status: "success",
      source: "cv_analysis",
      metadata: {
        assistanceMode: ASSISTANCE_MODE.copyPaste,
        workflowId: CV_SCORE_COPY_PASTE_WORKFLOW_ID,
        schemaVersion: CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
        model: CV_SCORE_COPY_PASTE_MODEL,
      },
    });

    return updated;
  }
}
