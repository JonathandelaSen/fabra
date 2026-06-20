import { Feedback } from "../../domain/entities/feedback.entity";
import { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";
import { FeedbackRepository } from "../../domain/repositories/feedback.repository";
import { UserId, notFound } from "@/backend/modules/shared";

interface Dependencies {
  feedbackRepo: FeedbackRepository;
}

export class GetFeedbackUseCase {
  constructor(private deps: Dependencies) {}

  async execute(userId: string, id: string): Promise<Feedback> {
    const feedback = await this.deps.feedbackRepo.findById(
      FeedbackId.fromPrimitives(id),
      UserId.fromPrimitives(userId),
    );
    if (!feedback) {
      notFound("Feedback not found");
    }
    return feedback;
  }
}
