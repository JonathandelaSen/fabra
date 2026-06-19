import { EntityId } from "@/backend/modules/shared";

export class JobAnalysisChatMessageId extends EntityId {
  private constructor(value: string) {
    super(value, "Analysis chat message id");
  }

  static fromPrimitives(value: string): JobAnalysisChatMessageId {
    return new JobAnalysisChatMessageId(value);
  }
}
