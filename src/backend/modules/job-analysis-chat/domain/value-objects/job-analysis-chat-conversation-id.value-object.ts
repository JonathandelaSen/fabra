import { EntityId } from "@/backend/modules/shared";

export class JobAnalysisChatConversationId extends EntityId {
  private constructor(value: string) {
    super(value, "Analysis chat conversation id");
  }

  static fromPrimitives(value: string): JobAnalysisChatConversationId {
    return new JobAnalysisChatConversationId(value);
  }
}
