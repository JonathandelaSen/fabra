import { UserId } from "@/backend/modules/shared";
import type { OpportunityPerson } from "../../domain/entities/opportunity-person.entity";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import type { OpportunityPersonRepository } from "../../domain/repositories/opportunity-person.repository";
import { JobOpportunityId } from "../../domain/value-objects/job-opportunity-id.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";

export interface ListOpportunityPeopleByAnalysisInput {
  analysisId: string;
  userId: string;
}

export class ListOpportunityPeopleByAnalysisUseCase {
  constructor(
    private readonly deps: {
      followUpRepo: FollowUpRepository;
      personRepo: OpportunityPersonRepository;
    },
  ) {}

  async execute(
    input: ListOpportunityPeopleByAnalysisInput,
  ): Promise<OpportunityPerson[]> {
    const userId = UserId.fromPrimitives(input.userId);
    const followUp = await this.deps.followUpRepo.findBySourceJobMatchAnalysisId(
      SourceJobMatchAnalysisId.fromPrimitives(input.analysisId),
      userId,
    );
    if (!followUp) return [];

    return this.deps.personRepo.search({
      jobOpportunityIds: [
        JobOpportunityId.fromPrimitives(
          followUp.toPrimitives().jobOpportunityId,
        ),
      ],
      userId,
    });
  }
}
