import type { DomainEvent } from "@/backend/modules/shared";

export class OpportunityPersonDeletedEvent implements DomainEvent<{
  personId: string;
}> {
  readonly eventName = "opportunity_person_deleted";
  readonly occurredAt = new Date();

  constructor(private readonly personId: string) {}

  toPrimitives() {
    return { personId: this.personId };
  }
}
