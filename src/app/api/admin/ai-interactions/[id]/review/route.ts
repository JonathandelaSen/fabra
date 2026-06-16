import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { aiInteractionsModule } from "@/lib/container";
import { isAdminUser } from "@/lib/observability";
import { errorResponse, forbidden, ok } from "@/modules/shared";
import { parseReviewAdminAIInteractionRequest } from "./validation";
import type { ReviewAdminAIInteractionResponse } from "./responses";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { user } = authContext;
    if (!(await isAdminUser(user.id))) throw forbidden("Forbidden");
    const body = await req.json();
    const parsed = parseReviewAdminAIInteractionRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    const review = await aiInteractionsModule.reviewAIInteraction.execute({
      interactionId: id,
      reviewerUserId: user.id,
      rating: parsed.value.rating,
      note: parsed.value.note,
    });
    return ok(review.toPrimitives() satisfies ReviewAdminAIInteractionResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
