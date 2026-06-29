import { UserId } from "@/backend/modules/shared";
import type { FollowUpEntry } from "../../domain/entities/follow-up-entry.entity";
import type { FollowUpEntryRepository } from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import { FollowUpId } from "../../domain/value-objects/follow-up-id.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";
import { FollowUpTrackingReadModel } from "../../domain/value-objects/follow-up-tracking-read-model.value-object";

export interface ListFollowUpTrackingByAnalysesInput {
  analysisIds: string[];
  userId: string;
}

export class ListFollowUpTrackingByAnalysesUseCase {
  constructor(
    private readonly deps: {
      followUpRepo: FollowUpRepository;
      entryRepo: FollowUpEntryRepository;
    },
  ) {}

  async execute(
    input: ListFollowUpTrackingByAnalysesInput,
  ): Promise<FollowUpTrackingReadModel[]> {
    if (input.analysisIds.length === 0) return [];
    const userId = UserId.fromPrimitives(input.userId);
    const followUps = await this.deps.followUpRepo.searchBySourceJobMatchAnalysisIds(
      input.analysisIds.map(SourceJobMatchAnalysisId.fromPrimitives),
      userId,
    );
    if (followUps.length === 0) return [];

    const entries = await this.deps.entryRepo.search({
      followUpIds: followUps.map((item) => FollowUpId.fromPrimitives(item.id)),
      userId,
    });
    const latestByFollowUpId = new Map<string, FollowUpEntry>();
    for (const entry of entries) {
      const primitives = entry.toPrimitives();
      const current = latestByFollowUpId.get(primitives.followUpId);
      if (
        !current ||
        Date.parse(primitives.createdAt) >
          Date.parse(current.toPrimitives().createdAt)
      ) {
        latestByFollowUpId.set(primitives.followUpId, entry);
      }
    }

    return followUps.map((followUp) => {
      const latestEntry = latestByFollowUpId.get(followUp.id);
      return FollowUpTrackingReadModel.fromPrimitives({
        followUp: followUp.toPrimitives(),
        entries: latestEntry ? [latestEntry.toPrimitives()] : [],
      });
    });
  }
}
