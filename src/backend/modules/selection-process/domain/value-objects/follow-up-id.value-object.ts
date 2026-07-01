import { EntityId } from "@/backend/modules/shared";

export class FollowUpId extends EntityId {
  private constructor(value: string) {
    super(value, "Follow-up id");
  }

  static fromPrimitives(value: string): FollowUpId {
    return new FollowUpId(value);
  }
}
