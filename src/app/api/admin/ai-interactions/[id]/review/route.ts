import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { aiInteractionsModule } from "@/lib/container";
import { isAdminUser } from "@/lib/observability";
import { badRequest, forbidden, ok } from "@/modules/shared";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { user } = authContext;
    if (!(await isAdminUser(user.id))) throw forbidden("Forbidden");
    const body = await req.json() as Record<string, unknown>;
    if (!["good", "mixed", "bad"].includes(String(body.rating))) {
      throw badRequest("Invalid rating");
    }
    const { id } = await params;
    const review = await aiInteractionsModule.reviewAIInteraction.execute({
      interactionId: id,
      reviewerUserId: user.id,
      rating: body.rating as "good" | "mixed" | "bad",
      note: typeof body.note === "string" ? body.note.trim() || null : null,
    });
    return ok(review.toPrimitives());
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
