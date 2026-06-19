import { NextRequest } from "next/server";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { performanceReviewModule } from "@/lib/container";
import {
  presentReviewEvidenceItem,
  presentReviewEvidenceItems,
} from "@/backend/modules/performance-review";
import { created, errorResponse, ok } from "@/backend/modules/shared";
import { parseAddEvidenceItemRequest } from "./validation";
import type {
  ListEvidenceItemsResponse,
  ReviewEvidenceItemResponse,
} from "./responses";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    performanceReviewModule.bindRequest(supabase);
    const items = await performanceReviewModule.listEvidenceItems.execute({
      reviewId: id,
      userId: user.id,
    });
    return ok(
      presentReviewEvidenceItems(items) satisfies ListEvidenceItemsResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const body = await req.json();
    const parsed = parseAddEvidenceItemRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    performanceReviewModule.bindRequest(supabase);
    const item = await performanceReviewModule.addEvidenceItem.execute({
      reviewId: id,
      userId: user.id,
      ...parsed.value,
    });
    return created(
      presentReviewEvidenceItem(item) satisfies ReviewEvidenceItemResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
