import { UserId, type EventBus } from "@/modules/shared";
import type { ProcessQuestionRepository } from "../../domain/repositories/process-question.repository";
import { ProcessQuestionId } from "../../domain/value-objects/process-question-id.value-object";

export interface DeleteProcessQuestionInput {
  id: string;
  userId: string;
}

export class DeleteProcessQuestionUseCase {
  constructor(
    private readonly deps: {
      questionRepo: ProcessQuestionRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: DeleteProcessQuestionInput): Promise<boolean> {
    const questionId = ProcessQuestionId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const existing = await this.deps.questionRepo.findById(questionId, userId);
    if (!existing) return false;

    existing.question.delete();
    const deleted = await this.deps.questionRepo.delete(questionId, userId);

    if (deleted) {
      const events = existing.question.pullDomainEvents();
      await this.deps.eventBus.publish(events);
    }
    return deleted;
  }
}
