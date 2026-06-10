import { UserId, type EventBus } from "@/modules/shared";
import { ReceivedFeedbackNotFoundError } from "../../domain/errors/received-feedback-not-found.error";
import type { ReceivedFeedbackRepository } from "../../domain/repositories/received-feedback.repository";
import { ReceivedFeedbackId } from "../../domain/value-objects/received-feedback-id.value-object";

export class DeleteReceivedFeedbackUseCase {
  constructor(
    private readonly deps: {
      receivedFeedbackRepo: ReceivedFeedbackRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const userIdVo = UserId.fromPrimitives(userId);
    const idVo = ReceivedFeedbackId.fromPrimitives(id);
    const feedback = await this.deps.receivedFeedbackRepo.findById(idVo, userIdVo);
    if (!feedback) throw new ReceivedFeedbackNotFoundError();

    feedback.delete();
    await this.deps.receivedFeedbackRepo.delete(idVo, userIdVo);
    
    const events = feedback.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
