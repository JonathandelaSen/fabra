import type { AIInteractionRating } from "@/modules/ai-interactions";

export interface ReviewAdminAIInteractionResponse {
  interactionId: string;
  reviewerUserId: string;
  rating: AIInteractionRating;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
