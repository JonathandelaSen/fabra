import { type EventBus } from "@/modules/shared";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";

export class CloseFeedbackUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(userId: string, feedbackId: string) {
    const feedback = await this.deps.feedbackRepo.findById(feedbackId, userId);
    if (!feedback) throw new FeedbackNotFoundError(feedbackId);
    feedback.close(new Date().toISOString());
    const saved = await this.deps.feedbackRepo.save(feedback);
    
    const events = feedback.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
