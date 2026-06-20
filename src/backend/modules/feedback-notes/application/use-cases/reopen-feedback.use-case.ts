import { UserId, type EventBus } from "@/backend/modules/shared";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";
import { Feedback } from "../../domain/entities/feedback.entity";
import { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";

export class ReopenFeedbackUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(userId: string, feedbackId: string): Promise<Feedback> {
    const feedback = await this.deps.feedbackRepo.findById(
      FeedbackId.fromPrimitives(feedbackId),
      UserId.fromPrimitives(userId),
    );
    if (!feedback) throw new FeedbackNotFoundError(feedbackId);
    feedback.reopen();
    const saved = await this.deps.feedbackRepo.save(feedback);
    
    const events = feedback.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
