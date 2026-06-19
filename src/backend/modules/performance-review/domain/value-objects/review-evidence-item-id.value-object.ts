import { EntityId } from "@/backend/modules/shared";

export class ReviewEvidenceItemId extends EntityId {
  private constructor(value: string) {
    super(value, "Review evidence item id");
  }

  static fromPrimitives(value: string): ReviewEvidenceItemId {
    return new ReviewEvidenceItemId(value);
  }
}
