import { EntityId } from "@/backend/modules/shared";

export class ProcessQuestionId extends EntityId {
  private constructor(value: string) {
    super(value, "Process question id");
  }

  static fromPrimitives(value: string): ProcessQuestionId {
    return new ProcessQuestionId(value);
  }
}
