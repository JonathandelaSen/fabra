import { EntityId } from "@/backend/modules/shared";

export class SourceJobMatchAnalysisId extends EntityId {
  private constructor(value: string) {
    super(value, "Source job match analysis id");
  }

  static fromPrimitives(value: string): SourceJobMatchAnalysisId {
    return new SourceJobMatchAnalysisId(value);
  }
}
