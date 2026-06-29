import { UserId } from "@/backend/modules/shared";
import type { FollowUpEntryRepository } from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import { FollowUpId } from "../../domain/value-objects/follow-up-id.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";
import { FollowUpTrackingReadModel } from "../../domain/value-objects/follow-up-tracking-read-model.value-object";

export interface GetFollowUpTrackingByAnalysisInput {
  analysisId: string;
  userId: string;
}

export class GetFollowUpTrackingByAnalysisUseCase {
  constructor(
    private readonly deps: {
      followUpRepo: FollowUpRepository;
      entryRepo: FollowUpEntryRepository;
    },
  ) {}

  async execute(
    input: GetFollowUpTrackingByAnalysisInput,
  ): Promise<FollowUpTrackingReadModel | null> {
    const userId = UserId.fromPrimitives(input.userId);
    const followUp = await this.deps.followUpRepo.findBySourceJobMatchAnalysisId(
      SourceJobMatchAnalysisId.fromPrimitives(input.analysisId),
      userId,
    );
    if (!followUp) return null;

    const entries = await this.deps.entryRepo.search({
      followUpIds: [FollowUpId.fromPrimitives(followUp.id)],
      userId,
    });
    entries.sort((first, second) => {
      const firstPrimitives = first.toPrimitives();
      const secondPrimitives = second.toPrimitives();
      return (
        Date.parse(secondPrimitives.occurredAt) -
          Date.parse(firstPrimitives.occurredAt) ||
        Date.parse(secondPrimitives.createdAt) -
          Date.parse(firstPrimitives.createdAt)
      );
    });

    return FollowUpTrackingReadModel.fromPrimitives({
      followUp: followUp.toPrimitives(),
      entries: entries.map((entry) => entry.toPrimitives()),
    });
  }
}
