import type { DomainEvent } from "@/backend/modules/shared";

export class OpportunityPersonCreatedEvent implements DomainEvent<{
  personId: string;
  jobOpportunityId: string;
}> {
  readonly eventName = "opportunity_person_created";
  readonly occurredAt = new Date();

  constructor(
    private readonly personId: string,
    private readonly jobOpportunityId: string,
  ) {}

  toPrimitives() {
    return {
      personId: this.personId,
      jobOpportunityId: this.jobOpportunityId,
    };
  }
}
