import { type EventBus } from "@/modules/shared";
import { Feedback } from "../../domain/entities/feedback.entity";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";

export interface CreateFeedbackInput {
  user_id: string;
  activity_context_id: string;
  person_name: string;
  final_feedback?: string | null;
}

export class CreateFeedbackUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: CreateFeedbackInput): Promise<Feedback> {
    const feedback = Feedback.create({
      id: crypto.randomUUID(),
      user_id: input.user_id,
      activity_context_id: input.activity_context_id,
      person_name: input.person_name,
      final_feedback: input.final_feedback,
      now: new Date().toISOString(),
    });
    const saved = await this.deps.feedbackRepo.save(feedback);

    const events = feedback.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
