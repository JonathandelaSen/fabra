import { EntityId } from "@/backend/modules/shared";

export class FollowUpEntryId extends EntityId {
  private constructor(value: string) {
    super(value, "Follow-up entry id");
  }

  static fromPrimitives(value: string): FollowUpEntryId {
    return new FollowUpEntryId(value);
  }
}
