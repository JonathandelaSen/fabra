import { Feedback } from "../../domain/entities/feedback.entity";
import { FeedbackRepository } from "../../domain/repositories/feedback.repository";
import { notFound } from "@/modules/shared";

interface Dependencies {
  feedbackRepo: FeedbackRepository;
}

export class GetFeedbackUseCase {
  constructor(private deps: Dependencies) {}

  async execute(userId: string, id: string): Promise<Feedback> {
    const feedback = await this.deps.feedbackRepo.findById(id, userId);
    if (!feedback) {
      notFound("Feedback not found");
    }
    return feedback;
  }
}
