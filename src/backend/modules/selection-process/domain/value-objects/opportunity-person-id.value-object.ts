import { ValueObject } from "@/backend/modules/shared";

export class OpportunityPersonId extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new Error("Opportunity person id is required");
  }

  static fromPrimitives(value: string): OpportunityPersonId {
    return new OpportunityPersonId(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
