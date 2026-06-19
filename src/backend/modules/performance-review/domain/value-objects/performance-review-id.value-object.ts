import { EntityId } from "@/modules/shared";

export class PerformanceReviewId extends EntityId {
  private constructor(value: string) {
    super(value, "Performance review id");
  }

  static fromPrimitives(value: string): PerformanceReviewId {
    return new PerformanceReviewId(value);
  }
}
