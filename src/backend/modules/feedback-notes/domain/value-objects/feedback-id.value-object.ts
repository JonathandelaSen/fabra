import { EntityId } from "@/backend/modules/shared";

export class FeedbackId extends EntityId {
  private constructor(value: string) {
    super(value, "Feedback id");
  }

  static fromPrimitives(value: string): FeedbackId {
    return new FeedbackId(value);
  }
}
