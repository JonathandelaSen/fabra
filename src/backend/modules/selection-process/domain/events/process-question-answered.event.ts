import type { DomainEvent } from "@/backend/modules/shared";

export class ProcessQuestionAnsweredEvent
  implements DomainEvent<{ questionId: string; aiGenerated: boolean }>
{
  readonly eventName = "process_question_answered";
  readonly occurredAt = new Date();

  constructor(
    private readonly questionId: string,
    private readonly aiGenerated: boolean
  ) {}

  toPrimitives(): { questionId: string; aiGenerated: boolean } {
    return { questionId: this.questionId, aiGenerated: this.aiGenerated };
  }
}
