import { UserId, type EventBus } from "@/modules/shared";
import { JobMatchAnalysis } from "../../domain/entities/job-match-analysis.entity";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";
import type { JobMatchScoringAIResult } from "../../domain/repositories/job-match-scoring-ai.service";
import { JobMatchAnalysisId } from "../../domain/value-objects/job-match-analysis-id.value-object";
import {
  JOB_MATCH_SCORE_COPY_PASTE_MODEL,
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
      eventBus: EventBus;
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

    current.applyAIResult({
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
    });

    const updated = await this.deps.repo.save(current);

    const events = current.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return updated;
  }
}
