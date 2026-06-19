import type { DomainEvent } from "@/backend/modules/shared";

export class ProcessQuestionDeletedEvent implements DomainEvent<{ questionId: string }> {
  readonly eventName = "process_question_deleted";
  readonly occurredAt = new Date();

  constructor(private readonly questionId: string) {}

  toPrimitives(): { questionId: string } {
    return { questionId: this.questionId };
  }
}
