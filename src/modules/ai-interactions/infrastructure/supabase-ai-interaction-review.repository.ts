import { BoundSupabaseRepository, type UserId } from "@/modules/shared";
import { AIInteractionReview, type AIInteractionRating } from "../domain/entities/ai-interaction-review.entity";
import type { AIInteractionReviewRepository } from "../domain/repositories/ai-interaction-review.repository";

export class SupabaseAIInteractionReviewRepository
  extends BoundSupabaseRepository
  implements AIInteractionReviewRepository
{
  async searchByReviewer(userId: UserId): Promise<AIInteractionReview[]> {
    const { data, error } = await this.client
      .from("ai_interaction_reviews")
      .select("*")
      .eq("reviewer_user_id", userId.toPrimitives());
    if (error) throw error;
    return (data ?? []).map(rowToEntity);
  }

  async save(review: AIInteractionReview): Promise<AIInteractionReview> {
    const p = review.toPrimitives();
    const { data, error } = await this.client
      .from("ai_interaction_reviews")
      .upsert({
        interaction_id: p.interactionId,
        reviewer_user_id: p.reviewerUserId,
        rating: p.rating,
        note: p.note,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
      }, { onConflict: "interaction_id" })
      .select("*")
      .single();
    if (error) throw error;
    return rowToEntity(data);
  }
}

function rowToEntity(row: Record<string, unknown>) {
  return AIInteractionReview.fromPrimitives({
    interactionId: row.interaction_id as string,
    reviewerUserId: row.reviewer_user_id as string,
    rating: row.rating as AIInteractionRating,
    note: row.note as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  });
}
