import { type EventBus } from "@/backend/modules/shared";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";

export class DeleteFeedbackUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(userId: string, feedbackId: string): Promise<void> {
    const feedback = await this.deps.feedbackRepo.findById(feedbackId, userId);
    if (!feedback) throw new FeedbackNotFoundError(feedbackId);
    feedback.delete();
    await this.deps.feedbackRepo.delete(feedbackId, userId);
    
    const events = feedback.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
