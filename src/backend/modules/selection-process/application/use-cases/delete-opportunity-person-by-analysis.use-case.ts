import {
  ExecutionResult,
  UserId,
  type EventBus,
} from "@/backend/modules/shared";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import type { OpportunityPersonRepository } from "../../domain/repositories/opportunity-person.repository";
import { OpportunityPersonId } from "../../domain/value-objects/opportunity-person-id.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";

export interface DeleteOpportunityPersonByAnalysisInput {
  analysisId: string;
  personId: string;
  userId: string;
}

export class DeleteOpportunityPersonByAnalysisUseCase {
  constructor(
    private readonly deps: {
      followUpRepo: FollowUpRepository;
      personRepo: OpportunityPersonRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(
    input: DeleteOpportunityPersonByAnalysisInput,
  ): Promise<ExecutionResult> {
    const userId = UserId.fromPrimitives(input.userId);
    const personId = OpportunityPersonId.fromPrimitives(input.personId);
    const [followUp, person] = await Promise.all([
      this.deps.followUpRepo.findBySourceJobMatchAnalysisId(
        SourceJobMatchAnalysisId.fromPrimitives(input.analysisId),
        userId,
      ),
      this.deps.personRepo.findById(personId, userId),
    ]);
    if (
      !followUp ||
      !person ||
      person.toPrimitives().jobOpportunityId !==
        followUp.toPrimitives().jobOpportunityId
    ) {
      return ExecutionResult.fail();
    }

    person.delete();
    const result = await this.deps.personRepo.delete(personId, userId);
    if (result.toPrimitives()) {
      await this.deps.eventBus.publish(person.pullDomainEvents());
    }
    return result;
  }
}
