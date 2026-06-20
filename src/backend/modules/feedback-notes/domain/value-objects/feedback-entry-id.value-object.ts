import { EntityId } from "@/backend/modules/shared";

export class FeedbackEntryId extends EntityId {
  private constructor(value: string) {
    super(value, "Feedback entry id");
  }

  static fromPrimitives(value: string): FeedbackEntryId {
    return new FeedbackEntryId(value);
  }
}
