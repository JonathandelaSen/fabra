import { EntityId } from "@/backend/modules/shared";

export class JobOpportunityId extends EntityId {
  private constructor(value: string) {
    super(value, "Job opportunity id");
  }

  static fromPrimitives(value: string): JobOpportunityId {
    return new JobOpportunityId(value);
  }
}
