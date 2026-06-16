import type { ListAdminAIInteractionsResponse } from "@/app/api/admin/ai-interactions/responses";
import type { ReviewAdminAIInteractionResponse } from "@/app/api/admin/ai-interactions/[id]/review/responses";
import { AI_INTERACTION_RATINGS } from "@/shared/ai-interactions/constants";

async function readJsonResponse<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(data.error || fallbackMessage);
  return data;
}

export async function listAdminAIInteractions() {
  const response = await fetch("/api/admin/ai-interactions");
  return readJsonResponse<ListAdminAIInteractionsResponse>(
    response,
    "Could not load AI interactions.",
  );
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
  return readJsonResponse<ReviewAdminAIInteractionResponse>(
    response,
    "Could not save review.",
  );
}
