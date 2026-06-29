import { ExecutionResult, UserId } from "@/backend/modules/shared";
import type { FollowUpEntryRepository } from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import { FollowUpEntryId } from "../../domain/value-objects/follow-up-entry-id.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";

export interface DeleteFollowUpEntryByAnalysisInput {
  analysisId: string;
  entryId: string;
  userId: string;
}

export class DeleteFollowUpEntryByAnalysisUseCase {
  constructor(
    private readonly deps: {
      followUpRepo: FollowUpRepository;
      entryRepo: FollowUpEntryRepository;
    },
  ) {}

  async execute(
    input: DeleteFollowUpEntryByAnalysisInput,
  ): Promise<ExecutionResult> {
    const userId = UserId.fromPrimitives(input.userId);
    const followUp = await this.deps.followUpRepo.findBySourceJobMatchAnalysisId(
      SourceJobMatchAnalysisId.fromPrimitives(input.analysisId),
      userId,
    );
    if (!followUp) return ExecutionResult.fail();

    const entryId = FollowUpEntryId.fromPrimitives(input.entryId);
    const entry = await this.deps.entryRepo.findById(entryId, userId);
    if (!entry || entry.toPrimitives().followUpId !== followUp.id) {
      return ExecutionResult.fail();
    }
    return this.deps.entryRepo.delete(entryId, userId);
  }
}
