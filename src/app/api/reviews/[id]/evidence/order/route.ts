import { NextRequest } from "next/server";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { performanceReviewModule } from "@/lib/container";
import { presentReviewEvidenceItems } from "@/modules/performance-review";
import { errorResponse, ok } from "@/modules/shared";
import { parseReorderEvidenceRequest } from "../../../validation";
import type { ListEvidenceItemsResponse } from "../../../responses";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const body = await req.json();
    const parsed = parseReorderEvidenceRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    performanceReviewModule.bindRequest(supabase);
    const items = await performanceReviewModule.reorderEvidenceItems.execute({
      reviewId: id,
      userId: user.id,
      orderedItemIds: parsed.value.orderedItemIds,
    });
    return ok(
      presentReviewEvidenceItems(items) satisfies ListEvidenceItemsResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
