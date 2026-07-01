import { EntityId } from "@/backend/modules/shared";

export class JobMatchAnalysisId extends EntityId {
  private constructor(value: string) {
    super(value, "Job match analysis id");
  }

  static override fromPrimitives(value: string): JobMatchAnalysisId {
    return new JobMatchAnalysisId(value);
  }
}
