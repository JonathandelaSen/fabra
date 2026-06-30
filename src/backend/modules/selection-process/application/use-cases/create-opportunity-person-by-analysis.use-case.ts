import {
  Timestamp,
  UserId,
  type EventBus,
} from "@/backend/modules/shared";
import { toOpportunityPersonProfile, type OpportunityPersonProfileInput } from "../opportunity-person-input";
import { OpportunityPerson } from "../../domain/entities/opportunity-person.entity";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import type { OpportunityPersonRepository } from "../../domain/repositories/opportunity-person.repository";
import { JobOpportunityId } from "../../domain/value-objects/job-opportunity-id.value-object";
import { OpportunityPersonId } from "../../domain/value-objects/opportunity-person-id.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";

export interface CreateOpportunityPersonByAnalysisInput
  extends OpportunityPersonProfileInput {
  analysisId: string;
  userId: string;
}

export class CreateOpportunityPersonByAnalysisUseCase {
  constructor(
    private readonly deps: {
      followUpRepo: FollowUpRepository;
      personRepo: OpportunityPersonRepository;
      eventBus: EventBus;
      randomId?: () => string;
      now?: () => string;
    },
  ) {}

  async execute(
    input: CreateOpportunityPersonByAnalysisInput,
  ): Promise<OpportunityPerson | null> {
    const userId = UserId.fromPrimitives(input.userId);
    const followUp = await this.deps.followUpRepo.ensureBySourceJobMatchAnalysisId(
      SourceJobMatchAnalysisId.fromPrimitives(input.analysisId),
      userId,
    );
    if (!followUp) return null;

    const now = Timestamp.fromPrimitives(
      this.deps.now?.() ?? new Date().toISOString(),
    );
    const person = OpportunityPerson.create({
      id: OpportunityPersonId.fromPrimitives(
        this.deps.randomId?.() ?? crypto.randomUUID(),
      ),
      userId,
      jobOpportunityId: JobOpportunityId.fromPrimitives(
        followUp.toPrimitives().jobOpportunityId,
      ),
      ...toOpportunityPersonProfile(input),
      createdAt: now,
      updatedAt: now,
    });
    const saved = await this.deps.personRepo.save(person);
    await this.deps.eventBus.publish(person.pullDomainEvents());
    return saved;
  }
}
