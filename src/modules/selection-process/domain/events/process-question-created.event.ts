import type { DomainEvent } from "@/modules/shared";

export class ProcessQuestionCreatedEvent implements DomainEvent<{ questionId: string }> {
  readonly eventName = "process_question_created";
  readonly occurredAt = new Date();

  constructor(private readonly questionId: string) {}

  toPrimitives(): { questionId: string } {
    return { questionId: this.questionId };
  }
}
