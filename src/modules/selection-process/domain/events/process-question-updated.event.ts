import type { DomainEvent } from "@/modules/shared";

export class ProcessQuestionUpdatedEvent implements DomainEvent<{ questionId: string; fields: string[] }> {
  readonly eventName = "process_question_updated";
  readonly occurredAt = new Date();

  constructor(
    private readonly questionId: string,
    private readonly fields: string[]
  ) {}

  toPrimitives(): { questionId: string; fields: string[] } {
    return { questionId: this.questionId, fields: this.fields };
  }
}
