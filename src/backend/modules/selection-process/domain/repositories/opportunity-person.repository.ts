import type {
  ExecutionResult,
  UserId,
} from "@/backend/modules/shared";
import type { OpportunityPerson } from "../entities/opportunity-person.entity";
import type { JobOpportunityId } from "../value-objects/job-opportunity-id.value-object";
import type { OpportunityPersonId } from "../value-objects/opportunity-person-id.value-object";

export interface OpportunityPersonSearchCriteria {
  jobOpportunityIds: JobOpportunityId[];
  userId: UserId;
}

export interface OpportunityPersonRepository {
  search(
    criteria: OpportunityPersonSearchCriteria,
  ): Promise<OpportunityPerson[]>;
  findById(
    id: OpportunityPersonId,
    userId: UserId,
  ): Promise<OpportunityPerson | null>;
  save(person: OpportunityPerson): Promise<OpportunityPerson>;
  delete(id: OpportunityPersonId, userId: UserId): Promise<ExecutionResult>;
}
