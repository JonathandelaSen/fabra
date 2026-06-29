import type { UserId } from "@/backend/modules/shared";
import type { FollowUp } from "../entities/follow-up.entity";
import type { SourceJobMatchAnalysisId } from "../value-objects/source-job-match-analysis-id.value-object";

export interface FollowUpRepository {
  searchBySourceJobMatchAnalysisIds(
    analysisIds: SourceJobMatchAnalysisId[],
    userId: UserId,
  ): Promise<FollowUp[]>;
  ensureBySourceJobMatchAnalysisId(
    analysisId: SourceJobMatchAnalysisId,
    userId: UserId,
  ): Promise<FollowUp | null>;
  findBySourceJobMatchAnalysisId(
    analysisId: SourceJobMatchAnalysisId,
    userId: UserId
  ): Promise<FollowUp | null>;
  save(followUp: FollowUp): Promise<FollowUp>;
}
