import { EntityId } from "@/backend/modules/shared";

export class CVAnalysisId extends EntityId {
  private constructor(value: string) {
    super(value, "CV analysis id");
  }

  static override fromPrimitives(value: string): CVAnalysisId {
    return new CVAnalysisId(value);
  }
}
