import type { ListAdminAIInteractionsResponse } from "@/app/api/admin/ai-interactions/responses";
import { AI_INTERACTION_RATINGS } from "@/shared/ai-interactions/constants";

export async function listAdminAIInteractions() {
  const response = await fetch("/api/admin/ai-interactions");
  if (!response.ok) throw new Error("Could not load AI interactions.");
  return response.json() as Promise<ListAdminAIInteractionsResponse>;
}

type AIInteractionRating =
  (typeof AI_INTERACTION_RATINGS)[keyof typeof AI_INTERACTION_RATINGS];

export async function reviewAdminAIInteraction(input: {
  interactionId: string;
  rating: AIInteractionRating;
  note: string | null;
}) {
  const response = await fetch(`/api/admin/ai-interactions/${input.interactionId}/review`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating: input.rating, note: input.note }),
  });
  if (!response.ok) throw new Error("Could not save review.");
  return response.json();
}
