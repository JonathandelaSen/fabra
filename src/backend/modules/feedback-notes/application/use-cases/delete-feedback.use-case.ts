import { UserId, type EventBus } from "@/backend/modules/shared";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";
import { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";

export class DeleteFeedbackUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(userId: string, feedbackId: string): Promise<void> {
    const userIdVo = UserId.fromPrimitives(userId);
    const feedbackIdVo = FeedbackId.fromPrimitives(feedbackId);
    const feedback = await this.deps.feedbackRepo.findById(feedbackIdVo, userIdVo);
    if (!feedback) throw new FeedbackNotFoundError(feedbackId);
    feedback.delete();
    await this.deps.feedbackRepo.delete(feedbackIdVo, userIdVo);
    
    const events = feedback.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
