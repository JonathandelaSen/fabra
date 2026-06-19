import { NextRequest } from "next/server";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { performanceReviewModule } from "@/lib/container";
import {
  presentReviewEvidenceItem,
  ReviewEvidenceItemNotFoundError,
} from "@/backend/modules/performance-review";
import { errorResponse, ok } from "@/backend/modules/shared";
import { parseUpdateEvidenceItemRequest } from "./validation";
import type { ReviewEvidenceItemResponse } from "./responses";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { itemId } = await params;
    const body = await req.json();
    const parsed = parseUpdateEvidenceItemRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    performanceReviewModule.bindRequest(supabase);
    const item = await performanceReviewModule.updateEvidenceItem.execute({
      id: itemId,
      userId: user.id,
      ...parsed.value,
    });
    return ok(
      presentReviewEvidenceItem(item) satisfies ReviewEvidenceItemResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { itemId } = await params;
    performanceReviewModule.bindRequest(supabase);
    const result = await performanceReviewModule.removeEvidenceItem.execute({
      id: itemId,
      userId: user.id,
    });
    if (!result.toPrimitives()) throw new ReviewEvidenceItemNotFoundError();
    return ok({ ok: true });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
