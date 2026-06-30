import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import { toOpportunityPersonProfile, type OpportunityPersonProfileInput } from "../opportunity-person-input";
import type { OpportunityPerson } from "../../domain/entities/opportunity-person.entity";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import type { OpportunityPersonRepository } from "../../domain/repositories/opportunity-person.repository";
import { OpportunityPersonId } from "../../domain/value-objects/opportunity-person-id.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";

export interface UpdateOpportunityPersonByAnalysisInput
  extends OpportunityPersonProfileInput {
  analysisId: string;
  personId: string;
  userId: string;
}

export class UpdateOpportunityPersonByAnalysisUseCase {
  constructor(
    private readonly deps: {
      followUpRepo: FollowUpRepository;
      personRepo: OpportunityPersonRepository;
      eventBus: EventBus;
      now?: () => string;
    },
  ) {}

  async execute(
    input: UpdateOpportunityPersonByAnalysisInput,
  ): Promise<OpportunityPerson | null> {
    const userId = UserId.fromPrimitives(input.userId);
    const [followUp, person] = await Promise.all([
      this.deps.followUpRepo.findBySourceJobMatchAnalysisId(
        SourceJobMatchAnalysisId.fromPrimitives(input.analysisId),
        userId,
      ),
      this.deps.personRepo.findById(
        OpportunityPersonId.fromPrimitives(input.personId),
        userId,
      ),
    ]);
    if (
      !followUp ||
      !person ||
      person.toPrimitives().jobOpportunityId !==
        followUp.toPrimitives().jobOpportunityId
    ) {
      return null;
    }

    person.update({
      ...toOpportunityPersonProfile(input),
      updatedAt: Timestamp.fromPrimitives(
        this.deps.now?.() ?? new Date().toISOString(),
      ),
    });
    const saved = await this.deps.personRepo.save(person);
    await this.deps.eventBus.publish(person.pullDomainEvents());
    return saved;
  }
}
