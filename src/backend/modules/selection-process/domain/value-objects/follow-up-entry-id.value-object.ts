import { ValueObject } from "@/backend/modules/shared";

export class FollowUpEntryId extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new Error("Follow-up entry id is required");
  }

  static fromPrimitives(value: string): FollowUpEntryId {
    return new FollowUpEntryId(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
