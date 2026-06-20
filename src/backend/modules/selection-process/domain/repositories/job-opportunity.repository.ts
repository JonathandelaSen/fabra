import type { UserId } from "@/backend/modules/shared";
import type { JobOpportunity } from "../entities/job-opportunity.entity";
import type { JobOpportunityId } from "../value-objects/job-opportunity-id.value-object";

export interface JobOpportunityRepository {
  findById(
    id: JobOpportunityId,
    userId: UserId,
  ): Promise<JobOpportunity | null>;
  save(opportunity: JobOpportunity): Promise<JobOpportunity>;
}
