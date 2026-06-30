import { ValueObject } from "@/backend/modules/shared";

export class OpportunityPersonName extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new Error("Opportunity person name is required");
  }

  static fromPrimitives(value: string): OpportunityPersonName {
    return new OpportunityPersonName(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
