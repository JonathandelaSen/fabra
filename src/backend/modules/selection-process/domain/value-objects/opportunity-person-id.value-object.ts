import { EntityId } from "@/backend/modules/shared";

export class OpportunityPersonId extends EntityId {
  private constructor(value: string) {
    super(value, "Opportunity person id");
  }

  static fromPrimitives(value: string): OpportunityPersonId {
    return new OpportunityPersonId(value.trim());
  }
}
