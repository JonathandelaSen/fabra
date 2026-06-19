import { type EventBus } from "@/backend/modules/shared";
import { FeedbackClosedError } from "../../domain/errors/feedback-closed.error";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";
import { Feedback } from "../../domain/entities/feedback.entity";

export interface UpdateFeedbackInput {
  person_name?: string;
  final_feedback?: string | null;
  activity_context_id?: string;
}

export class UpdateFeedbackUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(
    userId: string,
    feedbackId: string,
    input: UpdateFeedbackInput
  ): Promise<Feedback> {
    const feedback = await this.deps.feedbackRepo.findById(feedbackId, userId);
    if (!feedback) throw new FeedbackNotFoundError(feedbackId);
    if (!feedback.isActive()) throw new FeedbackClosedError(feedbackId);

    if (input.person_name !== undefined) {
      feedback.updatePersonName(input.person_name);
    }
    if (input.final_feedback !== undefined) {
      feedback.updateFinalFeedback(input.final_feedback);
    }
    if (input.activity_context_id !== undefined) {
      feedback.updateActivityContext(input.activity_context_id);
    }

    const saved = await this.deps.feedbackRepo.save(feedback);
    
    const events = feedback.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
