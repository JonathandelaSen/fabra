import type { UserId } from "@/modules/shared";
import type { AIInteractionReview } from "../entities/ai-interaction-review.entity";

export interface AIInteractionReviewRepository {
  searchByReviewer(userId: UserId): Promise<AIInteractionReview[]>;
  save(review: AIInteractionReview): Promise<AIInteractionReview>;
}
