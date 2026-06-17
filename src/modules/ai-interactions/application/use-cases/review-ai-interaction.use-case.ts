import { AIInteractionReview, type AIInteractionRating } from "../../domain/entities/ai-interaction-review.entity";
import type { AIInteractionReviewRepository } from "../../domain/repositories/ai-interaction-review.repository";

export class ReviewAIInteractionUseCase {
  constructor(private readonly deps: { repository: AIInteractionReviewRepository }) {}

  execute(input: {
    interactionId: string;
    reviewerUserId: string;
    rating: AIInteractionRating;
    note: string | null;
  }): Promise<AIInteractionReview> {
    const now = new Date().toISOString();
    return this.deps.repository.save(AIInteractionReview.create({
      ...input,
      createdAt: now,
      updatedAt: now,
    }));
  }
}
