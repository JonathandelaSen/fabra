import type { DomainEvent } from "@/modules/shared";

export class JobOpportunityCreatedEvent implements DomainEvent<{ opportunityId: string }> {
  readonly eventName = "job_opportunity_created";
  readonly occurredAt = new Date();

  constructor(private readonly opportunityId: string) {}

  toPrimitives(): { opportunityId: string } {
    return { opportunityId: this.opportunityId };
  }
}
