import { EntityId } from "@/backend/modules/shared";

export class CVPublicFeedbackId extends EntityId {
  private constructor(value: string) {
    super(value, "CV public feedback id");
  }

  static fromPrimitives(value: string): CVPublicFeedbackId {
    return new CVPublicFeedbackId(value);
  }
}
